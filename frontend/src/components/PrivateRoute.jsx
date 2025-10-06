import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('access_token');
  const userStr = localStorage.getItem('user');

  // Si no hay token, redirigir a login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay un rol requerido, verificar que el usuario lo tenga
  if (requiredRole && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.role_name !== requiredRole) {
        // Si el usuario no tiene el rol requerido, redirigir según su rol
        return <Navigate to={user.role_name === 'administrador' ? '/admin' : '/user'} replace />;
      }
    } catch (error) {
      console.error('Error parsing user:', error);
      return <Navigate to="/login" replace />;
    }
  }

  // Si todo está bien, renderizar el componente hijo
  return children;
};

export default PrivateRoute;
