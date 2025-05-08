import { useParams } from "react-router-dom";
import "./Usuario.css";
import Navbar from "../../components/navbar";
import { useEffect, useState } from "react";
import Cards from "../../components/Cards";
import OrdenCard from "../../components/OrderCards";

interface Restaurante {
  _id: string;
  nombre: string;
  direccion: {
    ciudad: string;
    calle: string;
  };
  tipo_comida: string[];
  onFavorito?: () => void;
  esFavorito?: boolean;
  promedio_puntaje?: number;
  total_reseñas?: number;
}

interface PedidoItem {
  articuloId: string;
  nombre: string;
  cantidad: number;
  precio: number;
}
interface Orden {
  _id: string;
  restaurante_id: string;
  restaurante_nombre: string;
  total: number;
  fecha: string;
  pedido: PedidoItem[];
  estado: string;
}

const Usuario = () => {
  const { id } = useParams();

  const [search, setSearch] = useState("");
  const [showMejorCalificados, setShowMejorCalificados] = useState(false);

  const [favoritos, setFavoritos] = useState<Restaurante[]>([]);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [showFavoritos, setShowFavoritos] = useState(false);
  const [showOrdenes, setShowOrdenes] = useState(false);
  const [tipoComida, setTipoComida] = useState("");

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:8000/usuarios/${id}/favoritos`)
      .then((res) => res.json())
      .then(setFavoritos)
      .catch((err) => {
        console.error("Error al obtener favoritos:", err);
        setFavoritos([]);
      });

    fetch(`http://localhost:8000/usuarios/${id}/ordenes`)
      .then((res) => res.json())
      .then(setOrdenes)
      .catch((err) => {
        console.error("Error al obtener órdenes:", err);
        setOrdenes([]);
      });
  }, [id]);

  useEffect(() => {
    if (showMejorCalificados) {
      fetch("http://localhost:8000/restaurantes/mejor_calificados")
        .then((res) => res.json())
        .then(setRestaurantes)
        .catch((err) => {
          console.error("Error al obtener los mejor calificados:", err);
          setRestaurantes([]);
        });
    } else {
      const urlParams = new URLSearchParams();
      if (search) urlParams.append("search", search);
      if (tipoComida) urlParams.append("tipo_comida", tipoComida);

      const url = `http://localhost:8000/restaurantes?${urlParams.toString()}`;

      fetch(url)
        .then((res) => res.json())
        .then(setRestaurantes)
        .catch((err) => {
          console.error("Error al obtener restaurantes:", err);
          setRestaurantes([]);
        });
    }
  }, [search, tipoComida, showMejorCalificados]);

  return (
    <div className="UserPage">
      <Navbar displayText={`Usuario: ${id}`} />

      <input
        type="text"
        placeholder="Buscar restaurantes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="searchBar"
      />

      <select
        value={tipoComida}
        onChange={(e) => setTipoComida(e.target.value)}
        className="searchBar"
      >
        <option value="">Todos los tipos</option>
        <option value="Italiana">Italiana</option>
        <option value="Pizzas">Pizzas</option>
        <option value="Mexicana">Mexicana</option>
        <option value="Tacos">Tacos</option>
        <option value="Japonesa">Japonesa</option>
        <option value="Sushi">Sushi</option>
      </select>

      <div className="toggleButtons">
        <button onClick={() => setShowFavoritos(!showFavoritos)}>
          {showFavoritos ? "Ocultar favoritos" : "Mostrar favoritos"}
        </button>
        <button onClick={() => setShowOrdenes(!showOrdenes)}>
          {showOrdenes ? "Ocultar órdenes" : "Mostrar órdenes Realizadas"}
        </button>
        <button onClick={() => setShowMejorCalificados(!showMejorCalificados)}>
          {showMejorCalificados
            ? "Ver todos los restaurantes"
            : "Mostrar mejor calificados"}
        </button>
      </div>

      {showOrdenes && (
        <div className="section">
          <h2>Órdenes realizadas</h2>
          {ordenes.length === 0 ? (
            <p>No has realizado órdenes todavía.</p>
          ) : (
            <div className="ordenes-grid">
              {ordenes.map((o) => (
                <OrdenCard
                  key={o._id}
                  restaurante={o.restaurante_nombre || o.restaurante_id}
                  total={o.total}
                  fecha={o.fecha}
                  pedido={o.pedido}
                  estado={o.estado}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showOrdenes || (
        <div className="section">
          <h2>{showFavoritos ? "Favoritos" : "Todos los restaurantes"}</h2>
          {(showFavoritos ? favoritos : restaurantes).map((r) => (
            <Cards
              key={r._id}
              {...r}
              esFavorito={favoritos.some((f) => f._id === r._id)}
              onFavorito={() => {
                const yaEsFavorito = favoritos.some((f) => f._id === r._id);
                const url = `http://localhost:8000/usuarios/${id}/favorito/${r._id}`;
                fetch(url, {
                  method: yaEsFavorito ? "DELETE" : "POST",
                }).then(() => {
                  setFavoritos((prev) =>
                    yaEsFavorito
                      ? prev.filter((f) => f._id !== r._id)
                      : [...prev, r]
                  );
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Usuario;
