// src/App.jsx

import React from 'react';
import { Routes, Route } from "react-router-dom";
import WelcomePage from './app/login/WelcomePage.jsx'; // Importación corregida
import LoginPage from './app/login/LoginPage.jsx'; 
import AdminDashboard from './app/dashboard/AdminDashboard.jsx'; 
import UserDashboard from './app/dashboard/UserDashboard.jsx';   // Importación corregida

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/AdminDashboard" element={<AdminDashboard />} />
      <Route path="/UserDashboard" element={<UserDashboard />} />
      {/* Puedes agregar más rutas aquí */}
    </Routes>
  );
}

export default App;