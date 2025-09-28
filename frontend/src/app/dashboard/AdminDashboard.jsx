import { Link, useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import TransactionsDashboard from './TransactionsDashboard';
import UserManagementView from './UserManagementView';

const AdminDashboard = ({ userName }) => {
  const location = useLocation();
  const [image, setImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Se asegura que la prop userName se muestre, o usa un default si es null
  const displayName = userName || 'Rayan Adlardard';
  const isTransactionsActive = location.pathname === '/admin/transactions';

  // Contenido de Bienvenida por defecto cuando no hay ruta específica seleccionada
  const WelcomeContent = (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-extrabold text-codecraftBlue">CodeCraft</h1>
        <p className="text-2xl font-semibold text-gray-700 mt-2">Sistema de Gestión de Inventario</p>
      </div>
      <div className="text-center">
        <h2 className="text-4xl font-bold text-slate-800 mb-4">¡Hola {displayName}!</h2>
        <p className="text-lg text-gray-500">
          Este sistema realiza el seguimiento de entradas y salidas <br /> del inventario en bodega.
        </p>
      </div>
      <div className="absolute bottom-4 text-sm text-gray-500">
        © Creado por Codecraft
      </div>
    </div>
  );

  // Mapeo de la ruta actual al componente de contenido
 let mainContent;
switch (location.pathname) {
  case '/admin/transactions':
    mainContent = <TransactionsDashboard />;
    break;
  case '/admin/users':
    mainContent = <UserManagementView />;
    break;
  default:
    mainContent = WelcomeContent;
    break;
}

  return (
    <div className="flex w-screen h-screen bg-slate-200">
      {/* Sidebar - Barra lateral (FIXED) */}
      <div className="w-56 bg-slate-100 shadow-lg flex flex-col justify-between fixed h-full z-10">
        <div className="p-4">
          {/* User Profile - Perfil de usuario */}
          <div className="flex flex-col items-center mb-8 mt-4">
            <div className="relative group w-20 h-20 rounded-full overflow-hidden mb-2">
              {image ? (
                <img src={image} alt="Admin Profile" className="w-full h-full object-cover" />
              ) : (
                <FaUserCircle className="text-8xl text-gray-400" />
              )}
              <label htmlFor="image-upload" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs text-center">
                Cambiar foto
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <h2 className="text-sm font-semibold text-gray-800">{displayName}</h2>
            <p className="text-xs text-gray-600">Recursos Humanos</p>
            <span className="text-xs text-gray-400">ADMINISTRADOR</span>
          </div>
          
          {/* Navigation Buttons - Botones de navegación */}
          <nav className="flex flex-col space-y-2"> 
            <Link 
              to="/admin/transactions" 
              className={`w-full text-center py-2 px-4 rounded-lg transition-colors text-white ${isTransactionsActive ? 'bg-sky-600 shadow-lg' : 'bg-codecraftBlue hover:bg-sky-500'}`}
            >
              Transacciones
            </Link>
            <Link to="#" className="w-full text-center py-2 px-4 rounded-lg text-white bg-codecraftBlue hover:bg-sky-500 transition-colors">
              Productos
            </Link>
            <Link 
              to="/admin/users"  
              className="w-full text-center py-2 px-4 rounded-lg text-white bg-codecraftBlue hover:bg-sky-500 transition-colors">
              Usuarios
            </Link>
          </nav>
        </div>
        
        {/* Logout Button - Botón de cerrar sesión */}
        <div className="p-4">
          <Link to="/" className="w-full text-center block py-3 px-4 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors">
            Cerrar Sesión
          </Link>
        </div>
      </div>
      
      {/* Main Content Area - Área de contenido principal */}
      <div className="flex-1 overflow-y-auto ml-56"> 
        {mainContent}
      </div>
    </div>
  );
};

export default AdminDashboard;
