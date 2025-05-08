// src/pages/EditarProducto.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./editarprod.css";
import Navbar from "../../components/navbar";

interface Producto {
  _id: string;
  restaurante_id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: string[];
  imagen?: string;
}

const EditarProducto = () => {
  const { productoId } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [imagen, setImagen] = useState<File | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/articulos/${productoId}`)
      .then((res) => res.json())
      .then(setProducto)
      .catch((err) => console.error("Error al cargar producto:", err));
  }, [productoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!producto) return;
    if (!productoId) return;

    try {
      // Actualiza datos del producto
      await fetch(`http://localhost:8000/articulos/${productoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio,
          tipo: producto.tipo,
        }),
      });

      // Si hay imagen nueva, súbela
      if (imagen) {
        const formData = new FormData();
        formData.append("imagen", imagen);
        formData.append("articulo_id", productoId);
        await fetch(`http://localhost:8000/articulos/imagen`, {
          method: "POST",
          body: formData,
        });
      }

      alert("Producto actualizado con éxito");
      navigate(-1); // volver
    } catch (err) {
      console.error("Error al actualizar producto:", err);
      alert("Ocurrió un error");
    }
  };

  if (!producto) return <p>Cargando producto...</p>;

  return (
    <>
      <Navbar displayText="Editar Producto" />

      <div className="editar-producto-page">
        <h2>Editar Producto</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={producto.nombre}
            onChange={(e) =>
              setProducto({ ...producto, nombre: e.target.value })
            }
            placeholder="Nombre"
          />
          <input
            type="number"
            value={producto.precio}
            onChange={(e) =>
              setProducto({ ...producto, precio: parseFloat(e.target.value) })
            }
            placeholder="Precio"
          />
          <input
            type="text"
            value={producto.descripcion}
            onChange={(e) =>
              setProducto({ ...producto, descripcion: e.target.value })
            }
            placeholder="Descripción"
          />
          <input
            type="text"
            value={producto.tipo.join(", ")}
            onChange={(e) =>
              setProducto({ ...producto, tipo: e.target.value.split(",") })
            }
            placeholder="Tipos (separados por coma)"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files?.[0] || null)}
          />

          <button type="submit">Guardar cambios</button>
        </form>
      </div>
    </>
  );
};

export default EditarProducto;
