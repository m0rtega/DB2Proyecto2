import os
from datetime import datetime
from typing import List, Optional

from fastapi import (
    FastAPI,
    HTTPException,
    Path,
    Body,
    UploadFile,
    File,
    Query,
    status,
)
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient, ASCENDING, DESCENDING, TEXT, GEOSPHERE
from pymongo.errors import DuplicateKeyError
from bson import ObjectId

app = FastAPI()

MONGO_URI = "mongodb+srv://geraxpineda:a@restaurante.j0pm3k9.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client["Proyecto"]

def serialize_doc(doc):
    doc["_id"] = str(doc["_id"])
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
        elif isinstance(value, list):
            doc[key] = [str(v) if isinstance(v, ObjectId) else v for v in value]
    return doc


@app.get("/")
def root():
    return {"message": "Connected..."}

# ---------------------------------------------------------------------------
# CRUD – RESTAURANTES
# ---------------------------------------------------------------------------

@app.post("/restaurantes", status_code=status.HTTP_201_CREATED, tags=["Restaurantes"])
async def crear_restaurante(restaurante: dict = Body(...)):
    try:
        restaurante["_id"] = ObjectId()
        db.restaurantes.insert_one(restaurante)
        return {"id": str(restaurante["_id"])}
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Restaurante duplicado")


@app.get("/restaurantes", tags=["Restaurantes"])
async def listar_restaurantes(
    limite: int = Query(50, le=100),
    skip: int = Query(0, ge=0),
    sort_por: str = Query("nombre", enum=["nombre", "_id"]),
    orden: str = Query("asc", enum=["asc", "desc"]),
):
    direccion = ASCENDING if orden == "asc" else DESCENDING
    cursor = (
        db.restaurantes.find({}, projection={"horario": 0})
        .sort(sort_por, direccion)
        .skip(skip)
        .limit(limite)
    )
    return [serialize_doc(r) for r in cursor]


@app.get(
    "/restaurantes/{restaurante_id}", tags=["Restaurantes"], response_model=dict
)
async def obtener_restaurante(restaurante_id: str = Path(..., description="ID del restaurante")):
    restaurante = db.restaurantes.find_one({"_id": ObjectId(restaurante_id)})
    if not restaurante:
        raise HTTPException(status_code=404, detail="Restaurante no encontrado")
    return serialize_doc(restaurante)


@app.put("/restaurantes/{restaurante_id}", tags=["Restaurantes"])
async def actualizar_restaurante(
    restaurante_id: str,
    datos: dict = Body(...),
):
    resultado = db.restaurantes.update_one(
        {"_id": ObjectId(restaurante_id)}, {"$set": datos}
    )
    if resultado.matched_count == 0:
        raise HTTPException(status_code=404, detail="Restaurante no encontrado")
    return {"mensaje": "Restaurante actualizado"}


@app.delete("/restaurantes/{restaurante_id}", status_code=204, tags=["Restaurantes"])
async def eliminar_restaurante(restaurante_id: str):
    resultado = db.restaurantes.delete_one({"_id": ObjectId(restaurante_id)})
    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Restaurante no encontrado")

# ---------------------------------------------------------------------------
# CRUD – USUARIOS
# ---------------------------------------------------------------------------


@app.post("/usuarios", status_code=201, tags=["Usuarios"])
async def crear_usuario(usuario: dict = Body(...)):
    usuario["_id"] = ObjectId()
    db.usuarios.insert_one(usuario)
    return {"id": str(usuario["_id"])}


@app.get("/usuarios", tags=["Usuarios"])
async def listar_usuarios(limite: int = 50, skip: int = 0):
    usuarios = db.usuarios.find().skip(skip).limit(limite)
    return [serialize_doc(u) for u in usuarios]


@app.get("/usuarios/{usuario_id}", tags=["Usuarios"])
async def obtener_usuario(usuario_id: str):
    usuario = db.usuarios.find_one({"_id": ObjectId(usuario_id)})
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return serialize_doc(usuario)


@app.put("/usuarios/{usuario_id}", tags=["Usuarios"])
async def actualizar_usuario(usuario_id: str, datos: dict = Body(...)):
    resultado = db.usuarios.update_one({"_id": ObjectId(usuario_id)}, {"$set": datos})
    if resultado.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"mensaje": "Usuario actualizado"}


@app.delete("/usuarios/{usuario_id}", status_code=204, tags=["Usuarios"])
async def eliminar_usuario(usuario_id: str):
    if db.usuarios.delete_one({"_id": ObjectId(usuario_id)}).deleted_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")



# ---------------------------------------------------------------------------
# CRUD – ARTÍCULOS
# ---------------------------------------------------------------------------


@app.post("/restaurantes/{restaurante_id}/menu", status_code=201, tags=["Artículos"])
async def agregar_articulo(restaurante_id: str, articulo: dict = Body(...)):
    articulo["_id"] = ObjectId()
    articulo["restaurante_id"] = ObjectId(restaurante_id)
    db.articulos.insert_one(articulo)
    return {"id": str(articulo["_id"])}


@app.get("/restaurantes/{restaurante_id}/menu", tags=["Artículos"])
async def listar_menu(
    restaurante_id: str,
    tipo: Optional[str] = Query(None, description="Filtrar por tipo de platillo"),
    limite: int = 100,
):
    filtro = {"restaurante_id": ObjectId(restaurante_id)}
    if tipo:
        filtro["tipo"] = tipo
    articulos = db.articulos.find(filtro, projection={"descripcion": 0}).limit(limite)
    return [serialize_doc(a) for a in articulos]


@app.get("/articulos/{articulo_id}", tags=["Artículos"])
async def obtener_articulo(articulo_id: str):
    articulo = db.articulos.find_one({"_id": ObjectId(articulo_id)})
    if not articulo:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    return serialize_doc(articulo)


@app.put("/articulos/{articulo_id}", tags=["Artículos"])
async def actualizar_articulo(articulo_id: str, datos: dict = Body(...)):
    resultado = db.articulos.update_one({"_id": ObjectId(articulo_id)}, {"$set": datos})
    if resultado.matched_count == 0:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    return {"mensaje": "Artículo actualizado"}


@app.delete("/articulos/{articulo_id}", status_code=204, tags=["Artículos"])
async def eliminar_articulo(articulo_id: str):
    if db.articulos.delete_one({"_id": ObjectId(articulo_id)}).deleted_count == 0:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")


# ---------------------------------------------------------------------------
# CRUD – ÓRDENES
# ---------------------------------------------------------------------------


@app.post("/ordenes", status_code=201, tags=["Órdenes"])
async def crear_orden(orden: dict = Body(...)):
    orden["_id"] = ObjectId()
    orden["usuario_id"] = ObjectId(orden["usuario_id"])
    orden["restaurante_id"] = ObjectId(orden["restaurante_id"])
    orden["fecha"] = datetime.utcnow()
    for item in orden["pedido"]:
        item["articuloId"] = ObjectId(item["articuloId"])
    orden["total"] = sum(i["precio"] * i["cantidad"] for i in orden["pedido"])
    db.ordenes.insert_one(orden)
    return {"id": str(orden["_id"])}


@app.get("/ordenes", tags=["Órdenes"])
async def listar_ordenes(
    usuario_id: Optional[str] = None,
    estado: Optional[str] = None,
    desde: Optional[datetime] = None,
    hasta: Optional[datetime] = None,
    limite: int = 100,
):
    filtro = {}
    if usuario_id:
        filtro["usuario_id"] = ObjectId(usuario_id)
    if estado:
        filtro["estado"] = estado
    if desde or hasta:
        rango = {}
        if desde:
            rango["$gte"] = desde
        if hasta:
            rango["$lte"] = hasta
        filtro["fecha"] = rango

    ordenes = (
        db.ordenes.find(filtro, projection={"pedido": 0})
        .sort("fecha", DESCENDING)
        .limit(limite)
    )
    return [serialize_doc(o) for o in ordenes]


@app.get("/ordenes/{orden_id}", tags=["Órdenes"])
async def obtener_orden(orden_id: str):
    orden = db.ordenes.find_one({"_id": ObjectId(orden_id)})
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return serialize_doc(orden)


@app.put("/ordenes/{orden_id}", tags=["Órdenes"])
async def actualizar_orden(orden_id: str, datos: dict = Body(...)):
    if "pedido" in datos:
        for item in datos["pedido"]:
            item["articuloId"] = ObjectId(item["articuloId"])
        datos["total"] = sum(i["precio"] * i["cantidad"] for i in datos["pedido"])
    resultado = db.ordenes.update_one({"_id": ObjectId(orden_id)}, {"$set": datos})
    if resultado.matched_count == 0:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return {"mensaje": "Orden actualizada"}


@app.delete("/ordenes/{orden_id}", status_code=204, tags=["Órdenes"])
async def eliminar_orden(orden_id: str):
    if db.ordenes.delete_one({"_id": ObjectId(orden_id)}).deleted_count == 0:
        raise HTTPException(status_code=404, detail="Orden no encontrada")




# ---------------------------------------------------------------------------
# CRUD – RESEÑAS
# ---------------------------------------------------------------------------


@app.post("/reseñas", status_code=201, tags=["Reseñas"])
async def agregar_resena(resena: dict = Body(...)):
    resena["_id"] = ObjectId()
    resena["usuario_id"] = ObjectId(resena["usuario_id"])
    resena["restaurante_id"] = ObjectId(resena["restaurante_id"])
    resena["fecha"] = datetime.utcnow()
    db.reseñas.insert_one(resena)
    return {"id": str(resena["_id"])}


@app.get("/reseñas", tags=["Reseñas"])
async def listar_resenas(
    restaurante_id: Optional[str] = None,
    usuario_id: Optional[str] = None,
    limite: int = 100,
    sort: str = Query("fecha", enum=["fecha", "puntaje"]),
    orden: str = Query("desc", enum=["asc", "desc"]),
):
    filtro = {}
    if restaurante_id:
        filtro["restaurante_id"] = ObjectId(restaurante_id)
    if usuario_id:
        filtro["usuario_id"] = ObjectId(usuario_id)
    direccion = ASCENDING if orden == "asc" else DESCENDING
    resenas = db.reseñas.find(filtro).sort(sort, direccion).limit(limite)
    return [serialize_doc(r) for r in resenas]


@app.get("/reseñas/{resena_id}", tags=["Reseñas"])
async def obtener_resena(resena_id: str):
    resena = db.reseñas.find_one({"_id": ObjectId(resena_id)})
    if not resena:
        raise HTTPException(status_code=404, detail="Reseña no encontrada")
    return serialize_doc(resena)


@app.put("/reseñas/{resena_id}", tags=["Reseñas"])
async def actualizar_resena(resena_id: str, datos: dict = Body(...)):
    resultado = db.reseñas.update_one({"_id": ObjectId(resena_id)}, {"$set": datos})
    if resultado.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reseña no encontrada")
    return {"mensaje": "Reseña actualizada"}


@app.delete("/reseñas/{resena_id}", status_code=204, tags=["Reseñas"])
async def eliminar_resena(resena_id: str):
    if db.reseñas.delete_one({"_id": ObjectId(resena_id)}).deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reseña no encontrada")

