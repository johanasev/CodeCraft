import React, { useState } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

const UserManagementView = () => {
  // 📦 Lista de usuarios
  const [users, setUsers] = useState([
    { id: 1, creationDate: '2025-01-15', email: 'usuario1@example.com', role: 'Administrador', name: 'Usuario Uno' },
    { id: 2, creationDate: '2025-02-20', email: 'usuario2@example.com', role: 'Usuario', name: 'Usuario Dos' },
    { id: 3, creationDate: '2025-03-10', email: 'usuario3@example.com', role: 'Usuario', name: 'Usuario Tres' },
  ]);

  // 📦 Estados modales
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // 📦 Estado para eliminación
  const [userToDelete, setUserToDelete] = useState(null);

  // 📦 Estado para edición
  const [userToEdit, setUserToEdit] = useState(null);

  // 📦 Estado del formulario de nuevo usuario
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Usuario',
    password: '',
    confirmPassword: '',
  });

  // 🛠️ Manejar inputs de creación
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  // 🛠️ Crear usuario
  const handleCreateUser = () => {
    if (newUser.password !== newUser.confirmPassword) {
      alert('❌ Las contraseñas no coinciden');
      return;
    }

    const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;
    const today = new Date().toISOString().split('T')[0];

    const userToAdd = {
      id: newId,
      creationDate: today,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    };

    setUsers([...users, userToAdd]);
    handleCloseModal();
  };

  // 🛠️ Cerrar modal creación
  const handleCloseModal = () => {
    setShowModal(false);
    setNewUser({ name: '', email: '', role: 'Usuario', password: '', confirmPassword: '' });
  };

  // 🛠️ Eliminar usuario
  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = () => {
    setUsers(users.filter((u) => u.id !== userToDelete.id));
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // 🛠️ Editar usuario
  const handleEdit = (user) => {
    setUserToEdit({ ...user }); // Copia para editar sin mutar directamente
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setUserToEdit({ ...userToEdit, [name]: value });
  };

  const handleUpdateUser = () => {
    setUsers(users.map((u) => (u.id === userToEdit.id ? userToEdit : u)));
    setShowEditModal(false);
    setUserToEdit(null);
  };

  return (
    <div className="min-h-screen p-8 bg-slate-200">
      {/* 🧑‍💻 Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold text-gray-800">Gestión de Usuarios</h2>
        <div className="flex items-center text-sm font-semibold text-gray-600">
          <span>Sistema de Gestión de Inventarios</span>
          <span className="text-sky-600 ml-1">CodeCraft</span>
        </div>
      </div>

      {/* ➕ Botón agregar */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-codecraftBlue hover:bg-sky-700 text-white font-bold py-2 px-4 rounded mb-6 transition-colors block ml-0 text-left"
      >
        Agregar Usuario
      </button>

      {/* 📊 Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">ID USUARIO</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">FECHA CREACIÓN</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">NOMBRE</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">CORREO</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">ROL</th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-gray-600">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 last:border-b-0 text-left">
                  <td className="py-4 px-4 text-sm text-gray-700">{user.id}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{user.creationDate}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{user.name}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{user.email}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{user.role}</td>
                  <td className="py-4 px-4 text-right">
                    <button
                      className="text-sky-600 hover:text-sky-800 transition-colors mr-3"
                      onClick={() => handleEdit(user)}
                    >
                      <FaEdit className="inline text-lg" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 transition-colors"
                      onClick={() => handleDelete(user)}
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

      {/* 🪟 Modal crear usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Agregar Nuevo Usuario</h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={newUser.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Correo</label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Rol</label>
                <select
                  name="role"
                  value={newUser.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                >
                  <option value="Usuario">Usuario</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Confirmar Contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={newUser.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition"
              >
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ❗ Modal eliminar */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Eliminar Usuario</h3>
            <p className="text-gray-700 mb-6">
              ¿Está seguro de que desea eliminar al usuario <strong>{userToDelete.email}</strong>?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ Modal editar */}
      {showEditModal && userToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Editar Usuario</h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={userToEdit.name}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Correo</label>
                <input
                  type="email"
                  name="email"
                  value={userToEdit.email}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Rol</label>
                <select
                  name="role"
                  value={userToEdit.role}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                >
                  <option value="Usuario">Usuario</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementView;
