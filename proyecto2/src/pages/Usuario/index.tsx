import { useParams } from "react-router-dom";
import "./Usuario.css";
import Navbar from "../../components/navbar";
import { useEffect, useState } from "react";
import Cards from "../../components/Cards";

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
}

interface Orden {
  _id: string;
  restaurante_id: string;
  total: number;
  fecha: string;
}

const Usuario = () => {
  const { id } = useParams();

  const [search, setSearch] = useState("");

  const [favoritos, setFavoritos] = useState<Restaurante[]>([]);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [showFavoritos, setShowFavoritos] = useState(false);
  const [showOrdenes, setShowOrdenes] = useState(false);
  const [tipoComida, setTipoComida] = useState("");

  useEffect(() => {
    fetch(`/api/usuarios/${id}/favoritos`)
      .then((res) => res.json())
      .then(setFavoritos);

    fetch(`/api/usuarios/${id}/ordenes`)
      .then((res) => res.json())
      .then(setOrdenes);
  }, [id]);

  useEffect(() => {
    const url = search
      ? `http://localhost:8000/restaurantes?search=${encodeURIComponent(
          search
        )}`
      : `http://localhost:8000/restaurantes`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRestaurantes(data);
        } else {
          setRestaurantes([]);
        }
      })
      .catch((err) => {
        console.error("Error al obtener restaurantes:", err);
        setRestaurantes([]);
      });
  }, [search]);

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
      </div>

      {/* {showFavoritos && (
        <div className="section">
          <h2>Restaurantes favoritos</h2>
          {favoritos.length === 0 ? (
            <p>No tienes favoritos todavía.</p>
          ) : (
            favoritos.map((r) => <div key={r._id}>{r.nombre}</div>)
          )}
        </div>
      )} */}

      {/* {showOrdenes && (
        <div className="section">
          <h2>Órdenes realizadas</h2>
          {ordenes.length === 0 ? (
            <p>No has realizado órdenes todavía.</p>
          ) : (
            ordenes.map((o) => (
              <div key={o._id}>
                Pedido en restaurante {o.restaurante_id} - Q{o.total} -{" "}
                {new Date(o.fecha).toLocaleDateString()}
              </div>
            ))
          )}
        </div>
      )} */}

      <div className="section">
        <h2>Todos los restaurantes</h2>
        {restaurantes.map((r) => (
          <Cards
            key={r._id}
            {...r}
            esFavorito={favoritos.some((f) => f._id === r._id)}
            onFavorito={() => {
              const yaEsFavorito = favoritos.some((f) => f._id === r._id);
              const url = `/api/usuarios/${id}/favorito/${r._id}`;
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
    </div>
  );
};

export default Usuario;
