import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import "./App.css";
import { useEffect } from "react";
import Usuario from "./pages/Usuario";
import Restaurante from "./pages/Restaurante";
import Manager from "./pages/Manager";
import EditarProducto from "./pages/EditarProducto";
import AgregarProductos from "./pages/AgregarProductos";

function App() {
  useEffect(() => {
    const loginInfo = localStorage.getItem("loginInfo");
    if (loginInfo) {
      const { tipo, id } = JSON.parse(loginInfo);
      const currentPath = window.location.pathname;

      if (tipo === "usuario" && currentPath !== `/usuario/${id}`) {
        window.location.href = `/usuario/${id}`;
      } else if (tipo === "restaurante" && currentPath !== `/manager/${id}`) {
        window.location.href = `/manager/${id}`;
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/usuario/:id" element={<Usuario />} />
        <Route path="/restaurante/:id" element={<Restaurante />} />
        <Route path="/manager/:id" element={<Manager />} />
        <Route
          path="/productos/editar/:productoId"
          element={<EditarProducto />}
        />
        <Route path="productos/agregar/:id" element={<AgregarProductos />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
