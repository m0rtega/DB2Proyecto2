import "./RestauranteCard.css";
import { useNavigate } from "react-router-dom";

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

const Cards = ({
  _id,
  nombre,
  direccion,
  tipo_comida,
  onFavorito,
  esFavorito = false,
  promedio_puntaje,
  total_reseñas,
}: Restaurante) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/restaurante/${_id}`);
  };

  return (
    <div
      className="restaurante-card"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <div className="header">
        <h3>{nombre}</h3>
        <button
          className="favorito-btn"
          onClick={(e) => {
            e.stopPropagation(); // Evita que al marcar favorito se navegue
            onFavorito?.();
          }}
        >
          {esFavorito ? "⭐" : "☆"}
        </button>
      </div>
      <p>
        🏢 Dirección: {direccion.calle}, {direccion.ciudad}
      </p>
      <p>🍽️ {tipo_comida.join(", ")}</p>

      {typeof promedio_puntaje === "number" && (
        <p>⭐ Promedio: {promedio_puntaje.toFixed(2)} / 5</p>
      )}

      {typeof total_reseñas === "number" && (
        <p>
          🗣️ {total_reseñas} reseña{total_reseñas === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
};

export default Cards;
