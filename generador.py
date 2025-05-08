import argparse
import os
import random
from datetime import datetime, timedelta

from bson import ObjectId
from faker import Faker
from pymongo import MongoClient
from tqdm import tqdm

faker = Faker("es_MX")

# ---------------------------------- Config ----------------------------------
MONGO_URI = "mongodb+srv://geraxpineda:a@restaurante.j0pm3k9.mongodb.net/?retryWrites=true&w=majority"

TOTAL_DOCS = 1000

NUM_RESTAURANTES = 1000
NUM_USUARIOS = 1000
NUM_ARTICULOS = 1000
NUM_ORDENES = 1000
NUM_RESEÑAS = 1000

MIN_ARTS_PER_REST = 2

ESTADOS_ORDEN = ["Pendiente", "En preparación", "Entregado", "Cancelado"]
TIPOS_COMIDA = [
    "Italiana",
    "Mexicana",
    "China",
    "Japonesa",
    "Vegetariana",
    "Pizzas",
    "Hamburguesas",
    "Postres",
]

TIPOS_ARTICULO = [
    "Pizza",
    "Taco",
    "Sushi",
    "Hamburguesa",
    "Ensalada",
    "Bebida",
    "Postre",
]

def random_coords():
    lat = 14.55 + random.random() * 0.15
    lon = -90.65 + random.random() * 0.3
    return [lon, lat]


def gen_restaurantes(n):
    for _ in range(n):
        nombre = f"{faker.company()} {random.choice(['Restaurant', 'Bistro', 'Diner', 'Café'])}"
        tipo_list = random.sample(TIPOS_COMIDA, k=random.randint(1, 2))
        yield {
            "_id": ObjectId(),
            "nombre": nombre,
            "direccion": {
                "calle": faker.street_name(),
                "ciudad": "Guatemala",
                "coordenadas": random_coords(),
            },
            "tipo_comida": tipo_list,
            "horario": {"abre": "10:00", "cierra": "22:00"},
        }


def gen_usuarios(n, restaurante_ids):
    for _ in range(n):
        uid = ObjectId()
        favoritos = random.sample(restaurante_ids, k=random.randint(1, 3))
        yield {
            "_id": uid,
            "nombre": faker.name(),
            "email": faker.unique.email(),
            "favoritos": favoritos,
        }


def gen_articulos(n, restaurante_ids):
    for _ in range(n):
        rid = random.choice(restaurante_ids)
        nombre = faker.catch_phrase()
        tipo = random.sample(TIPOS_ARTICULO, k=random.randint(1, 2))
        yield {
            "_id": ObjectId(),
            "restaurante_id": rid,
            "nombre": nombre,
            "descripcion": faker.sentence(),
            "precio": random.randint(30, 150),
            "tipo": tipo,
        }


def gen_ordenes(n, restaurante_ids, usuario_ids, articulos_by_rest):
    for _ in range(n):
        rid = random.choice(restaurante_ids)
        uid = random.choice(usuario_ids)
        articulos_rest = articulos_by_rest[rid]
        num_items = random.randint(1, 4)
        items = random.sample(articulos_rest, k=min(num_items, len(articulos_rest)))
        pedido = []
        total = 0
        for art in items:
            cantidad = random.randint(1, 3)
            subtotal = art["precio"] * cantidad
            total += subtotal
            pedido.append(
                {
                    "articuloId": art["_id"],
                    "nombre": art["nombre"],
                    "cantidad": cantidad,
                    "precio": art["precio"],
                }
            )
        fecha = faker.date_time_between(start_date="-1y", end_date="now")
        yield {
            "_id": ObjectId(),
            "usuario_id": uid,
            "restaurante_id": rid,
            "fecha": fecha,
            "estado": random.choice(ESTADOS_ORDEN),
            "pedido": pedido,
            "total": total,
        }


def gen_resenas(n, restaurante_ids, usuario_ids):
    for _ in range(n):
        yield {
            "_id": ObjectId(),
            "usuario_id": random.choice(usuario_ids),
            "restaurante_id": random.choice(restaurante_ids),
            "puntaje": random.randint(1, 5),
            "comentario": faker.sentence(nb_words=12),
            "fecha": faker.date_time_between(start_date="-1y", end_date="now"),
        }


def main():
    client = MongoClient(MONGO_URI)
    db = client["Proyecto"]

    # 1. Restaurantes
    print("Generando restaurantes…")
    restaurantes = list(tqdm(gen_restaurantes(NUM_RESTAURANTES), total=NUM_RESTAURANTES))
    db.restaurantes.insert_many(restaurantes)
    restaurante_ids = [r["_id"] for r in restaurantes]

    # 2. Usuarios
    print("Generando usuarios…")
    usuarios = list(tqdm(gen_usuarios(NUM_USUARIOS, restaurante_ids), total=NUM_USUARIOS))
    db.usuarios.insert_many(usuarios)
    usuario_ids = [u["_id"] for u in usuarios]

    # 3. Artículos
    print("Generando artículos del menú…")
    articulos = list(tqdm(gen_articulos(NUM_ARTICULOS, restaurante_ids), total=NUM_ARTICULOS))
    # db.articulos.insert_many(articulos)

    articulos_by_rest = {}
    for art in articulos:
        articulos_by_rest.setdefault(art["restaurante_id"], []).append(art)

    faltantes = [rid for rid in restaurante_ids if len(articulos_by_rest.get(rid, [])) < MIN_ARTS_PER_REST]
    if faltantes:
        print(f"Añadiendo artículos faltantes a {len(faltantes)} restaurantes…")
        extra_articulos = []
        for rid in faltantes:
            current = articulos_by_rest.get(rid, [])
            needed = MIN_ARTS_PER_REST - len(current)
            for _ in range(needed):
                art = next(gen_articulos(1, [rid]))
                extra_articulos.append(art)
                articulos_by_rest.setdefault(rid, []).append(art)
        db.articulos.insert_many(extra_articulos)

    restaurantes_con_art = list(articulos_by_rest.keys())

    # 4. Órdenes
    print("Generando órdenes…")
    ordenes = list(
        tqdm(
            gen_ordenes(NUM_ORDENES, restaurantes_con_art, usuario_ids, articulos_by_rest),
            total=NUM_ORDENES,
        )
    )
    db.ordenes.insert_many(ordenes)

    # 5. Reseñas
    print("Generando reseñas…")
    reseñas = list(tqdm(gen_resenas(NUM_RESEÑAS, restaurante_ids, usuario_ids), total=NUM_RESEÑAS))
    db.reseñas.insert_many(reseñas)

    print("\nCarga terminada Documentos totales:")
    for col in ["restaurantes", "usuarios", "articulos", "ordenes", "reseñas"]:
        print(f"  {col:12s}: {db[col].count_documents({}):,}")


if __name__ == "__main__":
    
    main()
