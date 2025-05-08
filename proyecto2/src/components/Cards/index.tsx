// components/RestauranteCard.tsx
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
}

const Cards = ({
  _id,
  nombre,
  direccion,
  tipo_comida,
  onFavorito,
  esFavorito = false,
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
        <button className="favorito-btn" onClick={onFavorito}>
          {esFavorito ? "⭐" : "☆"}
        </button>
      </div>
      <p>
        🏢 Direccion: {direccion.calle}, {direccion.ciudad}
      </p>
      <p>🍽️ {tipo_comida.join(", ")}</p>
    </div>
  );
};

export default Cards;
