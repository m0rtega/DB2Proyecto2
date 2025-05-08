import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import "./manager.css";

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

const Manager = () => {
  const { id } = useParams();
  const [vista, setVista] = useState<"ordenes" | "productos" | "datos">(
    "ordenes"
  );
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

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

      // Actualiza el estado eliminando las órdenes localmente
      setOrdenes((prev) => prev.filter((o) => !seleccionados.has(o._id)));
      setSeleccionados(new Set());
    } catch (err) {
      console.error("Error al eliminar múltiples órdenes:", err);
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
            {["Pendiente", "Preparando", "Entregado"].map((estado) => (
              <div key={estado} className="kanban-column">
                <h3>{estado}</h3>
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
        <div>
          <h2>Gestión de Productos</h2>
          <p>Aquí podrás administrar los artículos del restaurante.</p>
        </div>
      )}

      {vista === "datos" && (
        <div>
          <h2>Información del Restaurante</h2>
          <p>
            Aquí podrás actualizar la dirección, nombre, tipo de comida, etc.
          </p>
        </div>
      )}
    </div>
  );
};

export default Manager;
