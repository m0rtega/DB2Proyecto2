import { useEffect, useState } from "react";
import "./datosRestaurante.css";

interface Restaurante {
  nombre: string;
  direccion: {
    calle: string;
    ciudad: string;
    coordenadas: [number, number];
  };
  horario: {
    abre: string;
    cierra: string;
  };
  tipo_comida: string[];
}

const DatosRestaurante = ({ id }: { id: string }) => {
  const [restaurante, setRestaurante] = useState<Restaurante | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:8000/restaurantes/${id}`)
      .then((res) => res.json())
      .then(setRestaurante)
      .catch((err) => {
        console.error("Error al cargar datos del restaurante:", err);
        setError("No se pudieron cargar los datos");
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !restaurante) return;

    try {
      const res = await fetch(`http://localhost:8000/restaurantes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(restaurante),
      });

      if (!res.ok) throw new Error("Error al actualizar restaurante");

      alert("Datos actualizados correctamente");
    } catch (err) {
      console.error("Error al guardar cambios:", err);
      setError("No se pudieron guardar los cambios");
    }
  };

  if (!restaurante) return <p>Cargando datos del restaurante...</p>;

  return (
    <div className="datos-restaurante-form">
      <h2>Editar Restaurante</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre"
          value={restaurante.nombre}
          onChange={(e) =>
            setRestaurante({ ...restaurante, nombre: e.target.value })
          }
          required
        />

        <input
          type="text"
          placeholder="Calle"
          value={restaurante.direccion.calle}
          onChange={(e) =>
            setRestaurante({
              ...restaurante,
              direccion: {
                ...restaurante.direccion,
                calle: e.target.value,
              },
            })
          }
          required
        />
        <input
          type="text"
          placeholder="Ciudad"
          value={restaurante.direccion.ciudad}
          onChange={(e) =>
            setRestaurante({
              ...restaurante,
              direccion: {
                ...restaurante.direccion,
                ciudad: e.target.value,
              },
            })
          }
          required
        />

        <input
          type="number"
          placeholder="Longitud"
          value={restaurante.direccion.coordenadas[0]}
          onChange={(e) => {
            const nuevaCoord: [number, number] = [
              parseFloat(e.target.value),
              restaurante.direccion.coordenadas[1],
            ];
            setRestaurante({
              ...restaurante,
              direccion: {
                ...restaurante.direccion,
                coordenadas: nuevaCoord,
              },
            });
          }}
          step="any"
          required
        />

        <input
          type="number"
          placeholder="Latitud"
          value={restaurante.direccion.coordenadas[1]}
          onChange={(e) => {
            const nuevaCoord: [number, number] = [
              restaurante.direccion.coordenadas[0],
              parseFloat(e.target.value),
            ];
            setRestaurante({
              ...restaurante,
              direccion: {
                ...restaurante.direccion,
                coordenadas: nuevaCoord,
              },
            });
          }}
          step="any"
          required
        />

        <input
          type="time"
          value={restaurante.horario.abre}
          onChange={(e) =>
            setRestaurante({
              ...restaurante,
              horario: { ...restaurante.horario, abre: e.target.value },
            })
          }
          required
        />
        <input
          type="time"
          value={restaurante.horario.cierra}
          onChange={(e) =>
            setRestaurante({
              ...restaurante,
              horario: { ...restaurante.horario, cierra: e.target.value },
            })
          }
          required
        />

        <input
          type="text"
          placeholder="Tipos de comida (separados por coma)"
          value={restaurante.tipo_comida.join(", ")}
          onChange={(e) =>
            setRestaurante({
              ...restaurante,
              tipo_comida: e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t.length > 0),
            })
          }
        />

        <button type="submit">Guardar cambios</button>
      </form>
    </div>
  );
};

export default DatosRestaurante;
