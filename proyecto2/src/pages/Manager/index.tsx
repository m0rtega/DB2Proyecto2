import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import "./manager.css";
import DatosRestaurante from "../../components/DatosRestaurante";

interface PedidoItem {
  articuloId: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

interface Orden {
  _id: string;
  restaurante_nombre: string;
  total: number;
  fecha: string;
  pedido: PedidoItem[];
  estado: string;
}

interface Producto {
  _id: string;
  restaurante_id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: string[];
  imagen_id?: string;
}

const Manager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vista, setVista] = useState<"ordenes" | "productos" | "datos">(
    "ordenes"
  );
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    if (!id) return;

    // Órdenes
    fetch(`http://localhost:8000/ordenes?restaurante_id=${id}`)
      .then((res) => res.json())
      .then(setOrdenes)
      .catch((err) => console.error("Error al obtener órdenes:", err));

    // Productos
    fetch(`http://localhost:8000/restaurantes/${id}/menu`)
      .then((res) => res.json())
      .then(setProductos)
      .catch((err) => console.error("Error al obtener productos:", err));
  }, [id]);

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:8000/ordenes?restaurante_id=${id}`)
      .then((res) => res.json())
      .then(setOrdenes)
      .catch((err) => console.error("Error al obtener órdenes:", err));
  }, [id]);

  const columnas: { [key: string]: Orden[] } = {
    Pendiente: [],
    Preparando: [],
    Entregado: [],
  };

  ordenes.forEach((orden) => {
    if (columnas[orden.estado]) {
      columnas[orden.estado].push(orden);
    } else {
      columnas[orden.estado] = [orden];
    }
  });

  const moverOrden = async (
    idOrden: string,
    estadoActual: string,
    direccion: "left" | "right"
  ) => {
    const estados = ["Pendiente", "Preparando", "Entregado"];
    const actualIdx = estados.indexOf(estadoActual);
    const nuevoIdx = direccion === "left" ? actualIdx - 1 : actualIdx + 1;

    if (nuevoIdx < 0 || nuevoIdx >= estados.length) return;

    const nuevoEstado = estados[nuevoIdx];

    try {
      const res = await fetch(`http://localhost:8000/ordenes/${idOrden}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.ok) {
        setOrdenes((prev) =>
          prev.map((orden) =>
            orden._id === idOrden ? { ...orden, estado: nuevoEstado } : orden
          )
        );
      } else {
        console.error("Error al actualizar el estado");
      }
    } catch (err) {
      console.error("Error en la solicitud PUT:", err);
    }
  };

  const actualizarMasivo = async (estadoActual: string) => {
    const siguienteEstado =
      estadoActual === "Pendiente"
        ? "Preparando"
        : estadoActual === "Preparando"
        ? "Entregado"
        : null;

    if (!siguienteEstado || !id) return;

    const confirm = window.confirm(
      `¿Pasar todas las órdenes de ${estadoActual} a ${siguienteEstado}?`
    );
    if (!confirm) return;

    try {
      const res = await fetch("http://localhost:8000/ordenes/cambiar_estado", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurante_id: id,
          estado_actual: estadoActual,
          nuevo_estado: siguienteEstado,
        }),
      });

      if (!res.ok) throw new Error("Error actualizando estado masivo");

      const data = await res.json();
      console.log("Órdenes modificadas:", data.modificados);

      // Recargar órdenes
      const ordenesRes = await fetch(
        `http://localhost:8000/ordenes?restaurante_id=${id}`
      );
      const ordenesData = await ordenesRes.json();
      setOrdenes(ordenesData);
    } catch (err) {
      console.error("Error al cambiar estado masivo:", err);
    }
  };

  const toggleSeleccion = (id: string) => {
    setSeleccionados((prev) => {
      const copia = new Set(prev);
      if (copia.has(id)) {
        copia.delete(id);
      } else {
        copia.add(id);
      }
      return copia;
    });
  };

  const eliminarSeleccionados = async () => {
    const confirm = window.confirm(
      "¿Seguro que deseas eliminar las órdenes seleccionadas?"
    );
    if (!confirm) return;

    try {
      const res = await fetch("http://localhost:8000/ordenes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: Array.from(seleccionados) }),
      });

      if (!res.ok) {
        throw new Error("No se pudo eliminar las órdenes seleccionadas");
      }

      setOrdenes((prev) => prev.filter((o) => !seleccionados.has(o._id)));
      setSeleccionados(new Set());
    } catch (err) {
      console.error("Error al eliminar múltiples órdenes:", err);
    }
  };

  const eliminarProducto = async (productoId: string) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este producto?"
    );
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:8000/articulos/${productoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("No se pudo eliminar el producto");
      }

      setProductos((prev) => prev.filter((prod) => prod._id !== productoId));
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      alert("No se pudo eliminar el producto");
    }
  };

  const eliminarImagen = async (productoId: string, imagenId: string) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar esta imagen?"
    );
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:8000/imagenes/${imagenId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("No se pudo eliminar la imagen");
      }

      // Remover la imagen del producto en el frontend
      setProductos((prev) =>
        prev.map((prod) =>
          prod._id === productoId ? { ...prod, imagen_id: undefined } : prod
        )
      );
    } catch (err) {
      console.error("Error al eliminar imagen:", err);
      alert("No se pudo eliminar la imagen");
    }
  };

  return (
    <div className="manager-page">
      <Navbar displayText={`Restaurante: ${id}`} />

      <div className="manager-nav">
        <button
          onClick={() => setVista("ordenes")}
          className={vista === "ordenes" ? "active" : ""}
        >
          Órdenes
        </button>
        <button
          onClick={() => setVista("productos")}
          className={vista === "productos" ? "active" : ""}
        >
          Productos
        </button>
        <button
          onClick={() => setVista("datos")}
          className={vista === "datos" ? "active" : ""}
        >
          Datos del lugar
        </button>
      </div>

      {vista === "ordenes" && (
        <>
          {seleccionados.size > 0 && (
            <div className="acciones-globales">
              <button onClick={eliminarSeleccionados} className="btnRed">
                Eliminar seleccionados
              </button>
            </div>
          )}
          <div className="kanban-board">
            {["Pendiente", "Preparando", "Entregado"].map((estado, idx) => (
              <div key={estado} className="kanban-column">
                <h3
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {estado}
                  {estado !== "Entregado" && (
                    <button
                      onClick={() => actualizarMasivo(estado)}
                      className="btnSmall"
                    >
                      Pasar todo a {idx === 0 ? "Preparando" : "Entregado"}
                    </button>
                  )}
                </h3>
                {columnas[estado].map((orden) => (
                  <div key={orden._id} className="orden-card">
                    <input
                      type="checkbox"
                      className="orden-checkbox"
                      checked={seleccionados.has(orden._id)}
                      onChange={() => toggleSeleccion(orden._id)}
                    />
                    <p>
                      <strong>Fecha:</strong>{" "}
                      {new Date(orden.fecha).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Total:</strong> Q{orden.total}
                    </p>
                    <ul>
                      {orden.pedido.map((item, idx) => (
                        <li key={idx}>
                          {item.nombre} × {item.cantidad}
                        </li>
                      ))}
                    </ul>
                    <div className="orden-actions">
                      <button
                        onClick={() =>
                          moverOrden(orden._id, orden.estado, "left")
                        }
                        disabled={orden.estado === "Pendiente"}
                      >
                        ←
                      </button>
                      <button
                        onClick={() =>
                          moverOrden(orden._id, orden.estado, "right")
                        }
                        disabled={orden.estado === "Entregado"}
                      >
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {vista === "productos" && (
        <div className="productos-section">
          <h2>Gestión de Productos</h2>
          <div className="productos-grid">
            {/* Tarjeta para agregar nuevo producto */}
            <div
              className="producto-card add-product-card"
              style={{
                cursor: "pointer",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => navigate(`/productos/agregar/${id}`)}
            >
              <div className="add-icon">＋</div>
              <p>Agregar Producto</p>
            </div>

            {/* Tarjetas de productos existentes */}
            {productos.map((prod) => (
              <div key={prod._id} className="producto-card">
                {prod.imagen_id ? (
                  <div className="imagen-preview">
                    <img
                      src={`http://localhost:8000/imagenes/${prod.imagen_id}`}
                      alt={prod.nombre}
                      className="producto-img"
                    />
                    <button
                      type="button"
                      onClick={() => eliminarImagen(prod._id, prod.imagen_id!)}
                      className="btnRed"
                    >
                      Eliminar Imagen
                    </button>
                  </div>
                ) : (
                  <div className="producto-placeholder">Sin imagen</div>
                )}
                <h4>{prod.nombre}</h4>
                <p>Q{prod.precio}</p>
                <p>
                  <em>{prod.tipo.join(", ")}</em>
                </p>

                <div className="producto-actions">
                  <button
                    onClick={() => navigate(`/productos/editar/${prod._id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="btnRed"
                    onClick={() => eliminarProducto(prod._id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {vista === "datos" && id && <DatosRestaurante id={id} />}
    </div>
  );
};

export default Manager;
