// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App.jsx"; // <-- Asegúrate de que esta ruta sea correcta
import "./app/index.css"; // <-- La ruta al CSS global
import "./app/App.css"; // <-- Si tienes un segundo archivo CSS, esta también debe ser la ruta correcta

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);