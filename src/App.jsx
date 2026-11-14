import { Routes, Route } from "react-router-dom";
import Cuestionario from "./pages/Cuestionario.jsx";
import Resultados from "./pages/Resultados.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Cuestionario />} />
      <Route path="/resultados" element={<Resultados />} />
    </Routes>
  );
}