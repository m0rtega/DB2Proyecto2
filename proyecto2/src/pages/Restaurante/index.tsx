import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/navbar";
import "./restaurante.css";

interface RestauranteData {
  _id: string;
  nombre: string;
  direccion: {
    calle: string;
    ciudad: string;
  };
  tipo_comida: string[];
}

interface Articulo {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: string[];
  imagen_id?: string;
}

interface ItemPedido {
  articuloId: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface Resena {
  _id: string;
  usuario_id: string;
  restaurante_id: string;
  puntaje: number;
  comentario: string;
  fecha: string;
}

const Restaurante = () => {
  const { id } = useParams();
  const [comentario, setComentario] = useState("");
  const [puntaje, setPuntaje] = useState(5);

  const [restaurante, setRestaurante] = useState<RestauranteData | null>(null);
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [pedido, setPedido] = useState<ItemPedido[]>([]);

  useEffect(() => {
    console.warn("Cargando restaurante y artículos...");
    console.warn("ID Restaurante:", id);
    if (!id) return;

    fetch(`http://localhost:8000/restaurantes/${id}/detalle`)
      .then((res) => res.json())
      .then((data) => {
        setRestaurante(data.restaurante);
        setArticulos(data.articulos);
      })
      .catch((err) => {
        console.error("Error al cargar restaurante y artículos:", err);
      });

    fetch(`http://localhost:8000/reseñas?restaurante_id=${id}`)
      .then((res) => res.json())
      .then(setResenas)
      .catch((err) => console.error("Error al cargar reseñas:", err));
  }, [id]);

  const enviarResena = async (e: React.FormEvent) => {
    e.preventDefault();
    const loginInfo = localStorage.getItem("loginInfo");

    if (!loginInfo || !id) {
      alert("No estás logueado o falta el restaurante.");
      return;
    }

    const { id: usuario_id } = JSON.parse(loginInfo);

    const payload = {
      usuario_id,
      restaurante_id: id,
      puntaje,
      comentario,
    };

    try {
      const res = await fetch("http://localhost:8000/reseñas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al enviar reseña");

      const nueva = await res.json();

      // Actualizar lista de reseñas
      setResenas((prev) => [
        ...prev,
        {
          ...payload,
          _id: nueva.id,
          fecha: new Date().toISOString(),
        },
      ]);

      // Limpiar inputs
      setComentario("");
      setPuntaje(5);
      alert("Gracias por tu reseña");
    } catch (err) {
      console.error("Error al enviar reseña:", err);
      alert("No se pudo guardar tu reseña.");
    }
  };

  const agregarAlPedido = (articulo: Articulo) => {
    setPedido((prev) => {
      const existente = prev.find((item) => item.articuloId === articulo._id);
      if (existente) {
        return prev.map((item) =>
          item.articuloId === articulo._id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          articuloId: articulo._id,
          nombre: articulo.nombre,
          precio: articulo.precio,
          cantidad: 1,
        },
      ];
    });
  };

  const total = pedido.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0
  );

  const realizarPedido = async () => {
    const loginInfo = localStorage.getItem("loginInfo");

    if (!loginInfo || !restaurante) {
      alert("No se encontró la sesión de usuario o el restaurante.");
      return;
    }
    const { id: usuario_id } = JSON.parse(loginInfo);

    const ordenPayload = {
      usuario_id,
      restaurante_id: restaurante._id,
      estado: "Pendiente",
      pedido: pedido.map((item) => ({
        articuloId: item.articuloId,
        cantidad: item.cantidad,
        precio: item.precio,
      })),
    };

    try {
      const res = await fetch("http://localhost:8000/ordenes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ordenPayload),
      });

      if (!res.ok) {
        throw new Error("No se pudo enviar la orden.");
      }

      const data = await res.json();
      alert("Orden enviada con éxito. ID: " + data.id);
      setPedido([]); // limpia el carrito
    } catch (err) {
      console.error("Error al enviar la orden:", err);
      alert("Hubo un error al realizar la orden.");
    }
  };

  return (
    <div>
      <Navbar displayText={restaurante ? restaurante.nombre : "Cargando..."} />

      {restaurante && (
        <div className="restaurante-info">
          <h2>{restaurante.nombre}</h2>
          <p>
            📍 {restaurante.direccion.calle}, {restaurante.direccion.ciudad}
          </p>
          <p>🍽️ {restaurante.tipo_comida.join(", ")}</p>
        </div>
      )}

      <hr />

      <div className="restaurante-layout">
        <div className="menu-column">
          <h3>Menú</h3>
          {articulos.length === 0 ? (
            <p>No hay artículos disponibles.</p>
          ) : (
            <div className="menu-list">
              {articulos.map((art) => (
                <div key={art._id} className="menu-card">
                  {art.imagen_id && (
                    <img
                      src={`http://localhost:8000/imagenes/${art.imagen_id}`}
                      alt={art.nombre}
                      className="articulo-img"
                    />
                  )}
                  <h4>{art.nombre}</h4>
                  <p>
                    <strong>Precio:</strong> Q{art.precio}
                  </p>
                  <p>{art.descripcion}</p>
                  <p>
                    <em>{art.tipo.join(", ")}</em>
                  </p>
                  <button onClick={() => agregarAlPedido(art)}>Agregar</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pedido-column">
          <h3>Tu Pedido</h3>
          {pedido.length === 0 ? (
            <p>No has agregado artículos todavía.</p>
          ) : (
            <>
              <ul>
                {pedido.map((item) => (
                  <li key={item.articuloId}>
                    {item.nombre} × {item.cantidad} = Q
                    {item.precio * item.cantidad}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Total:</strong> Q{total}
              </p>
              <button onClick={realizarPedido}>Realizar pedido</button>
            </>
          )}
        </div>
        <hr />
        <div className="resenas-section">
          <h3>Reseñas del Restaurante</h3>
          {resenas.length === 0 ? (
            <p>No hay reseñas aún.</p>
          ) : (
            <div className="resenas-list">
              {resenas.map((r) => (
                <div key={r._id} className="resena-card">
                  <p>
                    <strong>Puntaje:</strong> {r.puntaje}/5 ⭐
                  </p>
                  <p>
                    <strong>Comentario:</strong> {r.comentario}
                  </p>
                  <p className="resena-fecha">
                    {new Date(r.fecha).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
          <hr />
          <div className="agregar-resena">
            <h4>Agregar Reseña</h4>
            <form onSubmit={enviarResena}>
              <label>
                Puntaje:
                <select
                  value={puntaje}
                  onChange={(e) => setPuntaje(parseInt(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((p) => (
                    <option key={p} value={p}>
                      {p} ⭐
                    </option>
                  ))}
                </select>
              </label>
              <textarea
                placeholder="Escribe tu comentario..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                required
              />
              <button type="submit">Enviar Reseña</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Restaurante;
