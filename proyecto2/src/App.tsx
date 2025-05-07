import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import "./App.css";
import { useEffect } from "react";
import Usuario from "./pages/Usuario";

function App() {
  useEffect(() => {
    const loginInfo = localStorage.getItem("loginInfo");
    if (loginInfo) {
      const { tipo, id } = JSON.parse(loginInfo);
      const currentPath = window.location.pathname;

      if (tipo === "usuario" && currentPath !== `/usuario/${id}`) {
        window.location.href = `/usuario/${id}`;
      } else if (
        tipo === "restaurante" &&
        currentPath !== `/restaurante/${id}`
      ) {
        window.location.href = `/restaurante/${id}`;
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/usuario/:id" element={<Usuario />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
