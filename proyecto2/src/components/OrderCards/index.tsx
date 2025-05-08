import "./OrdenCard.css";

interface PedidoItem {
  articuloId: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

interface OrdenCardProps {
  restaurante: string;
  total: number;
  fecha: string;
  pedido: PedidoItem[];
  estado: string;
}

const OrdenCard = ({
  restaurante,
  total,
  fecha,
  pedido,
  estado,
}: OrdenCardProps) => {
  const estadoClase =
    {
      Entregado: "estado-verde",
      Preparando: "estado-naranja",
      Pendiente: "estado-rojo",
    }[estado] || "estado-default";

  return (
    <div className="orden-card">
      <h3>{restaurante}</h3>
      <p>
        <strong>Fecha:</strong> {new Date(fecha).toLocaleDateString()}
      </p>

      <p>
        <strong>Estado:</strong> <span className={estadoClase}>{estado}</span>
      </p>

      <div className="pedido-lista">
        <h4>Pedido:</h4>
        <ul>
          {pedido.map((item, idx) => (
            <li key={idx}>
              {item.nombre} × {item.cantidad} – Q{item.precio * item.cantidad}
            </li>
          ))}
        </ul>
      </div>

      <p>
        <strong>Total:</strong> Q{total}
      </p>
    </div>
  );
};

export default OrdenCard;
