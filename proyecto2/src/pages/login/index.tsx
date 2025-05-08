import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const [userType, setUserType] = useState("usuario");
  const [id, setId] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    localStorage.setItem("loginInfo", JSON.stringify({ tipo: userType, id }));

    if (userType === "usuario") {
      window.location.href = `/usuario/${id}`;
    } else if (userType === "restaurante") {
      window.location.href = `/manager/${id}`;
    }
  };

  return (
    <div className="loginPage">
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <label htmlFor="tipo">Selecciona si eres usuario o restaurante:</label>
        <select
          id="tipo"
          name="tipo"
          style={{ marginBottom: "1rem" }}
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
        >
          <option value="usuario">Usuario</option>
          <option value="restaurante">Restaurante</option>
        </select>

        <input
          type="text"
          placeholder={`ID ${userType}`}
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>

      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <p>¿No tienes cuenta?</p>
        <button onClick={() => navigate("/signup")} className="btnSecondary">
          Registrarse
        </button>
      </div>
    </div>
  );
};

export default Login;
