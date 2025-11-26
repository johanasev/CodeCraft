import React from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import WelcomePage from './app/login/WelcomePage.jsx'; 
import LoginPage from './app/login/LoginPage.jsx'; 
import AdminDashboard from './app/dashboard/AdminDashboard.jsx'; 
import UserDashboard from './app/dashboard/UserDashboard.jsx'; 
import TransactionHistory from './app/dashboard/TransactionHistory.jsx';
import Proveedores from './app/dashboard/Suppliers.jsx';
import Suppliers from './app/dashboard/Suppliers.jsx';
import UserProductsView from './app/dashboard/UserProductsView.jsx';
// No necesitamos importar TransactionsDashboard aquí, se importa dentro de AdminDashboard

function App() {
  const location = useLocation();
  // Obtiene el nombre de usuario del estado de la ubicación o usa un valor predeterminado
  const userName = location.state?.userName || 'Administrador';

  return (
<Routes>
  <Route path="/" element={<WelcomePage />} />
  <Route path="/login" element={<LoginPage />} />

  {/* Agrupamos rutas hijas del admin */}
  <Route path="/admin" element={<AdminDashboard userName={userName} />} />
  <Route path="/admin/transactions" element={<AdminDashboard userName={userName} />} />
  <Route path="/admin/users" element={<AdminDashboard userName={userName} />} />
  <Route path="/admin/products" element={<AdminDashboard userName={userName} />} />
  <Route path='/admin/transactions/history' element={<TransactionHistory userName={userName} />} />
  <Route path='/admin/suppliers' element={<AdminDashboard userName={userName} />} />

  <Route path="/user" element={<UserDashboard />} />
  <Route path="/user/products" element={<UserDashboard userName={userName} />} />
  <Route path="/user/transactions" element={<UserDashboard userName={userName} />} />
</Routes>

  );
}

export default App;