import React from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; // Iconos de React
import { useLocation } from 'react-router-dom';


const UserManagementView = () => {
  // Datos de ejemplo para la tabla de usuarios
  const users = [
    { id: '1', creationDate: '2025-01-15', email: 'usuario1@example.com', role: 'Administrador' },
    { id: '2', creationDate: '2025-02-20', email: 'usuario2@example.com', role: 'Editor' },
    { id: '3', creationDate: '2025-03-10', email: 'usuario3@example.com', role: 'Lector' },
  ];

  // Handlers para las acciones
  const handleEdit = (id) => console.log(`Editar Usuario ${id}`);
  const handleDelete = (id) => console.log(`Eliminar Usuario ${id}`);

  return (
    <div className="min-h-screen p-8 bg-slate-200">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold text-gray-800">Gestión de Usuarios</h2>
        <div className="flex items-center text-sm font-semibold text-gray-600">
          <span>Sistema de Gestión de Inventarios</span>
          <span className="text-sky-600 ml-1">CodeCraft</span>
        </div>
      </div>
      
      {/* Botón de Agregar Usuario */}
        <button className="bg-codecraftBlue hover:bg-sky-700 text-white font-bold py-2 px-4 rounded mb-6 transition-colors block ml-0 text-left">
        AGREGAR USUARIO
        </button>



      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">ID USUARIO</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">FECHA CREACIÓN</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">CORREO</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">ROL</th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-gray-600">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 last:border-b-0">
                  <td className="py-4 px-4 text-sm text-gray-700">{user.id}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{user.creationDate}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{user.email}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{user.role}</td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      className="text-sky-600 hover:text-sky-800 transition-colors mr-3"
                      onClick={() => handleEdit(user.id)}
                    >
                      <FaEdit className="inline text-lg" />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-800 transition-colors"
                      onClick={() => handleDelete(user.id)}
                    >
                      <FaTrashAlt className="inline text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementView;