import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signup.css";

const SignUp = () => {
  const [tipo, setTipo] = useState<"usuario" | "restaurante">("usuario");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  // Restaurante fields
  const [calle, setCalle] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [horaAbre, setHoraAbre] = useState("");
  const [horaCierra, setHoraCierra] = useState("");
  const [tipos, setTipos] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let payload = {};
      let endpoint = "";

      if (tipo === "usuario") {
        endpoint = "usuarios";
        payload = {
          nombre,
          email,
          favoritos: [],
        };
      } else {
        endpoint = "restaurantes";
        payload = {
          nombre,
          direccion: {
            calle,
            ciudad,
            coordenadas: [parseFloat(longitud), parseFloat(latitud)],
          },
          horario: {
            abre: horaAbre,
            cierra: horaCierra,
          },
          tipo_comida: tipos.split(",").map((t) => t.trim()),
        };
      }

      const res = await fetch(`http://localhost:8000/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.id) throw new Error("No se pudo registrar");

      alert(`¡Registro exitoso! Guarda este ID: ${data.id}`);

      navigate(`/login`);
    } catch (err) {
      console.error("Error en el registro:", err);
      alert("Ocurrió un error al registrar.");
    }
  };

  return (
    <div className="signupPage">
      <h1>Registro de {tipo === "usuario" ? "Usuario" : "Restaurante"}</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Tipo:
          <select value={tipo} onChange={(e) => setTipo(e.target.value as any)}>
            <option value="usuario">Usuario</option>
            <option value="restaurante">Restaurante</option>
          </select>
        </label>

        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        {tipo === "usuario" ? (
          <>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Calle"
              value={calle}
              onChange={(e) => setCalle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Longitud"
              value={longitud}
              onChange={(e) => setLongitud(e.target.value)}
              step="any"
              required
            />
            <input
              type="number"
              placeholder="Latitud"
              value={latitud}
              onChange={(e) => setLatitud(e.target.value)}
              step="any"
              required
            />
            <input
              type="time"
              value={horaAbre}
              onChange={(e) => setHoraAbre(e.target.value)}
              required
            />
            <input
              type="time"
              value={horaCierra}
              onChange={(e) => setHoraCierra(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Tipos de comida (separados por coma)"
              value={tipos}
              onChange={(e) => setTipos(e.target.value)}
            />
          </>
        )}

        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default SignUp;
