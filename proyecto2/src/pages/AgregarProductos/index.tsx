import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/navbar";
import "./agregarprod.css";

interface ProductoForm {
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: string[];
  imagen?: File | null;
}

const AgregarProductos = () => {
  const { id } = useParams(); // id del restaurante
  const navigate = useNavigate();
  const [productos, setProductos] = useState<ProductoForm[]>([
    { nombre: "", descripcion: "", precio: 0, tipo: [], imagen: null },
  ]);

  const agregarFila = () => {
    setProductos([
      ...productos,
      { nombre: "", descripcion: "", precio: 0, tipo: [], imagen: null },
    ]);
  };

  const actualizarProducto = (
    index: number,
    campo: keyof ProductoForm,
    valor: any
  ) => {
    const copia = [...productos];
    if (campo === "tipo") {
      copia[index][campo] = valor.split(",").map((t: string) => t.trim());
    } else {
      copia[index][campo] = valor;
    }
    setProductos(copia);
  };

  const enviarProductos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const formData = new FormData();

    const articulosSinImagen = productos.map((prod) => ({
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      precio: prod.precio,
      tipo: prod.tipo,
    }));

    formData.append("articulos_json", JSON.stringify(articulosSinImagen));

    productos.forEach((prod) => {
      if (prod.imagen) {
        formData.append("imagenes", prod.imagen);
      } else {
        formData.append(
          "imagenes",
          new Blob([], { type: "application/octet-stream" })
        );
      }
    });

    try {
      const res = await fetch(
        `http://localhost:8000/restaurantes/${id}/menu/lote`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Error al enviar productos");

      alert("Productos agregados con éxito");
      navigate(-1);
    } catch (err) {
      console.error("Error al enviar productos:", err);
      alert("Ocurrió un error al enviar los productos");
    }
  };

  return (
    <>
      <Navbar displayText="Agregar Productos" />
      <div className="agregar-productos-page">
        <form onSubmit={enviarProductos}>
          {productos.map((prod, idx) => (
            <div className="producto-form" key={idx}>
              <h4>Producto {idx + 1}</h4>
              <input
                type="text"
                placeholder="Nombre"
                value={prod.nombre}
                onChange={(e) =>
                  actualizarProducto(idx, "nombre", e.target.value)
                }
                required
              />
              <input
                type="number"
                placeholder="Precio"
                value={prod.precio}
                onChange={(e) =>
                  actualizarProducto(idx, "precio", parseFloat(e.target.value))
                }
                required
              />
              <input
                type="text"
                placeholder="Descripción"
                value={prod.descripcion}
                onChange={(e) =>
                  actualizarProducto(idx, "descripcion", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Tipos (separados por coma)"
                value={prod.tipo.join(", ")}
                onChange={(e) =>
                  actualizarProducto(idx, "tipo", e.target.value)
                }
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  actualizarProducto(idx, "imagen", e.target.files?.[0] || null)
                }
              />
              <hr />
            </div>
          ))}
          <button type="button" onClick={agregarFila}>
            + Agregar otro producto
          </button>
          <button type="submit" className="btnPrimary">
            Guardar todos
          </button>
        </form>
      </div>
    </>
  );
};

export default AgregarProductos;
