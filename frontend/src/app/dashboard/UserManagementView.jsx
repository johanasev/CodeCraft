import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { inventoryService } from '../../api/inventoryService';

const UserManagementView = () => {
  // 📦 Lista de usuarios
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    password: '',
    password_confirm: '',
  });

  // 🔄 Cargar usuarios y roles al montar el componente
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getUsers();
      // La API puede devolver un objeto con paginación o un array directo
      const usersList = Array.isArray(data) ? data : (data.results || []);
      setUsers(usersList);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error al cargar usuarios');
      setUsers([]); // Asegurar que users sea un array aunque haya error
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await inventoryService.getRoles();
      const rolesList = Array.isArray(data) ? data : (data.results || []);
      setRoles(rolesList);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setRoles([]); // Asegurar que roles sea un array aunque haya error
    }
  };

  // 🛠️ Manejar inputs de creación
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  // 🛠️ Crear usuario
  const handleCreateUser = async () => {
    if (newUser.password !== newUser.password_confirm) {
      alert('❌ Las contraseñas no coinciden');
      return;
    }

    if (!newUser.first_name || !newUser.last_name || !newUser.email || !newUser.password || !newUser.role) {
      alert('❌ Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      await inventoryService.createUser(newUser);
      await fetchUsers();
      handleCloseModal();
      alert('✅ Usuario creado exitosamente');
    } catch (err) {
      console.error('Error creating user:', err);
      alert('❌ Error al crear usuario: ' + (err.response?.data?.detail || 'Error desconocido'));
    }
  };

  // 🛠️ Cerrar modal creación
  const handleCloseModal = () => {
    setShowModal(false);
    setNewUser({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      role: '',
      password: '',
      password_confirm: '',
    });
  };

  // 🛠️ Eliminar usuario
  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await inventoryService.deleteUser(userToDelete.id);
      await fetchUsers();
      setShowDeleteModal(false);
      setUserToDelete(null);
      alert('✅ Usuario eliminado exitosamente');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('❌ Error al eliminar usuario');
    }
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

  const handleUpdateUser = async () => {
    try {
      await inventoryService.updateUser(userToEdit.id, userToEdit);
      await fetchUsers();
      setShowEditModal(false);
      setUserToEdit(null);
      alert('✅ Usuario actualizado exitosamente');
    } catch (err) {
      console.error('Error updating user:', err);
      alert('❌ Error al actualizar usuario');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-slate-200 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

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
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 last:border-b-0 text-left">
                    <td className="py-4 px-4 text-sm text-gray-700">{user.id}</td>
                    <td className="py-4 px-4 text-sm text-gray-700">
                      {new Date(user.registration_date).toLocaleDateString('es-CO')}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">{user.email}</td>
                    <td className="py-4 px-4 text-sm text-gray-700">{user.role_name}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🪟 Modal crear usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Agregar Nuevo Usuario</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nombre *</label>
                <input
                  type="text"
                  name="first_name"
                  value={newUser.first_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Apellido *</label>
                <input
                  type="text"
                  name="last_name"
                  value={newUser.last_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">Correo *</label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={newUser.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Rol *</label>
                <select
                  name="role"
                  value={newUser.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                  required
                >
                  <option value="">Seleccione un rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">Dirección</label>
                <input
                  type="text"
                  name="address"
                  value={newUser.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Contraseña *</label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                  required
                  minLength="8"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Confirmar Contraseña *</label>
                <input
                  type="password"
                  name="password_confirm"
                  value={newUser.password_confirm}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                  required
                  minLength="8"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nombre</label>
                <input
                  type="text"
                  name="first_name"
                  value={userToEdit.first_name}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Apellido</label>
                <input
                  type="text"
                  name="last_name"
                  value={userToEdit.last_name}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>

              <div className="col-span-2">
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
                <label className="block text-sm font-semibold mb-1">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={userToEdit.phone || ''}
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
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">Dirección</label>
                <input
                  type="text"
                  name="address"
                  value={userToEdit.address || ''}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
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
