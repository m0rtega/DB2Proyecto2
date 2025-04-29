from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
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

@app.get("/restaurantes")
def get_restaurantes():
    restaurantes = list(db.restaurantes.find())
    return [serialize_doc(r) for r in restaurantes]

@app.get("/usuarios/{usuario_id}")
def get_usuario(usuario_id: str):
    try:
        usuario = db.usuarios.find_one({"_id": ObjectId(usuario_id)})
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return serialize_doc(usuario)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@app.get("/restaurantes/{restaurante_id}/menu")
def get_menu(restaurante_id: str):
    articulos = list(db.articulos.find({"restaurante_id": ObjectId(restaurante_id)}))
    return [serialize_doc(a) for a in articulos]

@app.post("/ordenes")
def crear_orden(orden: dict):
    orden["_id"] = ObjectId()
    orden["usuario_id"] = ObjectId(orden["usuario_id"])
    orden["restaurante_id"] = ObjectId(orden["restaurante_id"])
    for item in orden["pedido"]:
        item["articuloId"] = ObjectId(item["articuloId"])
    db.ordenes.insert_one(orden)
    return {"mensaje": "Orden creada exitosamente", "id": str(orden["_id"])}

@app.post("/reseñas")
def agregar_resena(resena: dict):
    resena["_id"] = ObjectId()
    resena["usuario_id"] = ObjectId(resena["usuario_id"])
    resena["restaurante_id"] = ObjectId(resena["restaurante_id"])
    db.reseñas.insert_one(resena)
    return {"mensaje": "Reseña agregada", "id": str(resena["_id"])}

