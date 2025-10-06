import React from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import WelcomePage from './app/login/WelcomePage.jsx';
import LoginPage from './app/login/LoginPage.jsx';
import AdminDashboard from './app/dashboard/AdminDashboard.jsx';
import UserDashboard from './app/dashboard/UserDashboard.jsx';
import TransactionHistory from './app/dashboard/TransactionHistory.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
// No necesitamos importar TransactionsDashboard aquí, se importa dentro de AdminDashboard

function App() {
  const location = useLocation();
  // Obtiene el nombre de usuario del estado de la ubicación o usa un valor predeterminado
  const userName = location.state?.userName || 'Administrador';

  return (
<Routes>
  <Route path="/" element={<WelcomePage />} />
  <Route path="/login" element={<LoginPage />} />

  {/* Rutas protegidas del admin */}
  <Route path="/admin" element={
    <PrivateRoute requiredRole="administrador">
      <AdminDashboard userName={userName} />
    </PrivateRoute>
  } />
  <Route path="/admin/transactions" element={
    <PrivateRoute requiredRole="administrador">
      <AdminDashboard userName={userName} />
    </PrivateRoute>
  } />
  <Route path="/admin/users" element={
    <PrivateRoute requiredRole="administrador">
      <AdminDashboard userName={userName} />
    </PrivateRoute>
  } />
  <Route path="/admin/products" element={
    <PrivateRoute requiredRole="administrador">
      <AdminDashboard userName={userName} />
    </PrivateRoute>
  } />
  <Route path='/admin/transactions/history' element={
    <PrivateRoute requiredRole="administrador">
      <TransactionHistory userName={userName} />
    </PrivateRoute>
  } />

  {/* Ruta protegida del usuario */}
  <Route path="/user" element={
    <PrivateRoute>
      <UserDashboard />
    </PrivateRoute>
  } />
</Routes>

  );
}

export default App;