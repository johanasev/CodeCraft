import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { inventoryService } from "../../api/inventoryService";


const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar proveedores del backend
  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getSuppliers();
      setProveedores(Array.isArray(data) ? data : (data.results || []));
      setError(null);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [proveedorAEditar, setProveedorAEditar] = useState(null);
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null);

  const [nuevoProveedor, setNuevoProveedor] = useState({
    name: "",
    type: "Nacional",
    contact: "",
    phone: "",
    email: "",
    address: "",
  });

// Exportar PDF (sin errores de codificación)
const exportToPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("CodeCraft – Sistema de Gestión de Inventarios", 14, 20);
  doc.setFontSize(13);
  doc.text("Listado de Proveedores", 14, 30);
doc.setFontSize(10);
doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 36);

  const tableData = proveedoresFiltrados.map((p) => [
    p.id,
    p.name,
    p.type,
    p.contact,
    p.email,
    p.address,
  ]);

  autoTable(doc, {
    head: [["ID", "Nombre", "Tipo", "Contacto", "Correo", "Dirección"]],
    body: tableData,
    startY: 40,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [60, 141, 188], textColor: 255, halign: "center" },
  });

  doc.save("reporte-proveedores-codecraft.pdf");
};

  // 🔍 Filtros
  const proveedoresFiltrados = proveedores.filter((p) => {
    const textoCoincide =
      p.name.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      p.contact.toLowerCase().includes(filtroTexto.toLowerCase());
    const tipoCoincide =
      filtroTipo === "Todos" || p.type === filtroTipo;
    const estadoCoincide =
      filtroEstado === "Todos" ||
      (filtroEstado === "Activos" && p.is_active) ||
      (filtroEstado === "Inactivos" && !p.is_active);
    return textoCoincide && tipoCoincide && estadoCoincide;
  });

  // 🧩 Manejo de cambios
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoProveedor({ ...nuevoProveedor, [name]: value });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setProveedorAEditar({ ...proveedorAEditar, [name]: value });
  };

  // ➕ Crear
  const handleCreateProveedor = async () => {
    // Validaciones mejoradas en el frontend
    const errors = [];

    if (!nuevoProveedor.name || nuevoProveedor.name.trim().length < 3) {
      errors.push('• El nombre del proveedor es obligatorio y debe tener al menos 3 caracteres');
    }

    if (!nuevoProveedor.email || nuevoProveedor.email.trim() === '') {
      errors.push('• El email es obligatorio');
    } else if (!nuevoProveedor.email.includes('@') || !nuevoProveedor.email.includes('.')) {
      errors.push('• El email debe tener un formato válido (ejemplo@dominio.com)');
    }

    if (!nuevoProveedor.contact || nuevoProveedor.contact.trim().length < 2) {
      errors.push('• El nombre del contacto es obligatorio y debe tener al menos 2 caracteres');
    }

    if (!nuevoProveedor.phone || nuevoProveedor.phone.trim().length < 7) {
      errors.push('• El teléfono es obligatorio y debe tener al menos 7 dígitos');
    }

    if (!nuevoProveedor.address || nuevoProveedor.address.trim().length < 10) {
      errors.push('• La dirección es obligatoria y debe ser más específica (mínimo 10 caracteres)');
    }

    if (errors.length > 0) {
      alert('Por favor corrija los siguientes errores:\n\n' + errors.join('\n'));
      return;
    }

    // Verificar si el email ya existe
    const emailExists = proveedores.some(p => p.email.toLowerCase() === nuevoProveedor.email.toLowerCase());
    if (emailExists) {
      alert('❌ Error: Ya existe un proveedor registrado con este email.\nPor favor, use un email diferente.');
      return;
    }

    try {
      await inventoryService.createSupplier(nuevoProveedor);
      await fetchProveedores();
      setShowAddModal(false);
      setNuevoProveedor({
        name: "",
        type: "Nacional",
        contact: "",
        phone: "",
        email: "",
        address: "",
      });
    } catch (err) {
      console.error('Error creating supplier:', err);
      const errorDetail = err.response?.data;
      let errorMessage = '❌ Error al crear el proveedor:\n\n';

      if (errorDetail) {
        if (typeof errorDetail === 'string') {
          errorMessage += `• ${errorDetail}`;
        } else if (errorDetail.detail) {
          errorMessage += `• ${errorDetail.detail}`;
        } else if (errorDetail.message) {
          errorMessage += `• ${errorDetail.message}`;
        } else {
          // Si hay errores de campo específicos del servidor
          const fieldErrors = [];
          const fieldNames = {
            name: 'Nombre',
            email: 'Email',
            contact: 'Contacto',
            phone: 'Teléfono',
            address: 'Dirección',
            type: 'Tipo'
          };

          Object.keys(errorDetail).forEach(field => {
            const friendlyFieldName = fieldNames[field] || field;
            if (Array.isArray(errorDetail[field])) {
              fieldErrors.push(`• ${friendlyFieldName}: ${errorDetail[field].join(', ')}`);
            } else {
              fieldErrors.push(`• ${friendlyFieldName}: ${errorDetail[field]}`);
            }
          });
          errorMessage += fieldErrors.join('\n');
        }
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage += '• No se pudo conectar con el servidor. Verifique su conexión a internet.';
      } else {
        errorMessage += `• ${err.message || 'Error desconocido del servidor'}`;
      }

      alert(errorMessage);
    }
  };

  // ✏️ Editar
  const handleEdit = (proveedor) => {
    setProveedorAEditar({ ...proveedor });
    setShowEditModal(true);
  };

  const handleUpdateProveedor = async () => {
    // Validaciones mejoradas en el frontend
    const errors = [];

    if (!proveedorAEditar.name || proveedorAEditar.name.trim().length < 3) {
      errors.push('• El nombre del proveedor es obligatorio y debe tener al menos 3 caracteres');
    }

    if (!proveedorAEditar.email || proveedorAEditar.email.trim() === '') {
      errors.push('• El email es obligatorio');
    } else if (!proveedorAEditar.email.includes('@') || !proveedorAEditar.email.includes('.')) {
      errors.push('• El email debe tener un formato válido (ejemplo@dominio.com)');
    }

    if (!proveedorAEditar.contact || proveedorAEditar.contact.trim().length < 2) {
      errors.push('• El nombre del contacto es obligatorio y debe tener al menos 2 caracteres');
    }

    if (!proveedorAEditar.phone || proveedorAEditar.phone.trim().length < 7) {
      errors.push('• El teléfono es obligatorio y debe tener al menos 7 dígitos');
    }

    if (!proveedorAEditar.address || proveedorAEditar.address.trim().length < 10) {
      errors.push('• La dirección es obligatoria y debe ser más específica (mínimo 10 caracteres)');
    }

    if (errors.length > 0) {
      alert('Por favor corrija los siguientes errores:\n\n' + errors.join('\n'));
      return;
    }

    // Verificar si el email ya existe (excluyendo el proveedor actual)
    const emailExists = proveedores.some(p =>
      p.id !== proveedorAEditar.id &&
      p.email.toLowerCase() === proveedorAEditar.email.toLowerCase()
    );
    if (emailExists) {
      alert('❌ Error: Ya existe otro proveedor registrado con este email.\nPor favor, use un email diferente.');
      return;
    }

    try {
      await inventoryService.updateSupplier(proveedorAEditar.id, proveedorAEditar);
      await fetchProveedores();
      setShowEditModal(false);
      setProveedorAEditar(null);
    } catch (err) {
      console.error('Error updating supplier:', err);
      const errorDetail = err.response?.data;
      let errorMessage = '❌ Error al actualizar el proveedor:\n\n';

      if (errorDetail) {
        if (typeof errorDetail === 'string') {
          errorMessage += `• ${errorDetail}`;
        } else if (errorDetail.detail) {
          errorMessage += `• ${errorDetail.detail}`;
        } else if (errorDetail.message) {
          errorMessage += `• ${errorDetail.message}`;
        } else {
          const fieldErrors = [];
          const fieldNames = {
            name: 'Nombre',
            email: 'Email',
            contact: 'Contacto',
            phone: 'Teléfono',
            address: 'Dirección',
            type: 'Tipo'
          };

          Object.keys(errorDetail).forEach(field => {
            const friendlyFieldName = fieldNames[field] || field;
            if (Array.isArray(errorDetail[field])) {
              fieldErrors.push(`• ${friendlyFieldName}: ${errorDetail[field].join(', ')}`);
            } else {
              fieldErrors.push(`• ${friendlyFieldName}: ${errorDetail[field]}`);
            }
          });
          errorMessage += fieldErrors.join('\n');
        }
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage += '• No se pudo conectar con el servidor. Verifique su conexión a internet.';
      } else {
        errorMessage += `• ${err.message || 'Error desconocido del servidor'}`;
      }

      alert(errorMessage);
    }
  };

  // 🗑️ Eliminar
  const handleDelete = (proveedor) => {
    setProveedorAEliminar(proveedor);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await inventoryService.deleteSupplier(proveedorAEliminar.id);
      await fetchProveedores();
      setShowDeleteModal(false);
      setProveedorAEliminar(null);
      alert('✅ Proveedor eliminado exitosamente');
    } catch (err) {
      console.error('Error deleting supplier:', err);
      const errorDetail = err.response?.data;

      // Si el backend indica que se puede desactivar, mostrar opción
      if (errorDetail?.can_deactivate) {
        const userConfirm = window.confirm(
          `⚠️ ${errorDetail.error}\n\n${errorDetail.detail}\n\n¿Desea inactivar el proveedor en lugar de eliminarlo?\n\nPresione OK para inactivar, o Cancelar para volver.`
        );

        if (userConfirm) {
          try {
            await inventoryService.deactivateSupplier(proveedorAEliminar.id);
            await fetchProveedores();
            setShowDeleteModal(false);
            setProveedorAEliminar(null);
            alert('✅ Proveedor inactivado exitosamente');
          } catch (deactivateErr) {
            alert(`❌ Error al inactivar el proveedor: ${deactivateErr.message}`);
          }
        }
        return;
      }

      // Error genérico
      let errorMessage = '❌ Error al eliminar el proveedor:\n\n';
      if (errorDetail) {
        if (typeof errorDetail === 'string') {
          errorMessage += `• ${errorDetail}`;
        } else if (errorDetail.detail) {
          errorMessage += `• ${errorDetail.detail}`;
        } else if (errorDetail.error) {
          errorMessage += `• ${errorDetail.error}`;
        } else {
          errorMessage += '• No se pudo completar la operación';
        }
      } else {
        errorMessage += `• ${err.message || 'Error desconocido'}`;
      }

      alert(errorMessage);
    }
  };

  // Activar/Desactivar proveedor
  const handleToggleActive = async (proveedor) => {
    const action = proveedor.is_active ? 'inactivar' : 'activar';
    const confirm = window.confirm(`¿Está seguro de ${action} el proveedor "${proveedor.name}"?`);

    if (confirm) {
      try {
        if (proveedor.is_active) {
          await inventoryService.deactivateSupplier(proveedor.id);
        } else {
          await inventoryService.activateSupplier(proveedor.id);
        }
        await fetchProveedores();
        alert(`✅ Proveedor ${action === 'inactivar' ? 'inactivado' : 'activado'} exitosamente`);
      } catch (err) {
        alert(`❌ Error al ${action} el proveedor: ${err.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen p-8 bg-slate-200">
      {/* 🧾 Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold text-gray-800">Gestión de Proveedores</h2>
        <div className="flex items-center text-sm font-semibold text-gray-600">
          <span>Sistema de Gestión de Inventarios</span>
          <span className="text-sky-600 ml-1">CodeCraft</span>
        </div>
      </div>

      {/* 🔍 Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Filtros de búsqueda</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre o contacto..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full focus:ring focus:ring-sky-200"
          />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full focus:ring focus:ring-sky-200"
          >
            <option value="Todos">Todos los tipos</option>
            <option value="Nacional">Nacional</option>
            <option value="Internacional">Internacional</option>
          </select>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full focus:ring focus:ring-sky-200"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Activos">Activos</option>
            <option value="Inactivos">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-xl text-gray-600">Cargando proveedores...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* 📋 Tabla de proveedores */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                {["ID", "Fecha", "Nombre", "Tipo", "Contacto", "Teléfono", "Correo", "Dirección", "Estado", "Acciones"].map((col) => (
                  <th key={col} className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proveedoresFiltrados.map((p) => (
                <tr key={p.id} className={`border-b border-gray-200 ${!p.is_active ? 'bg-gray-100 opacity-60' : ''}`}>
                  <td className="py-3 px-4 text-sm">{p.id}</td>
                  <td className="py-3 px-4 text-sm">{p.registration_date ? new Date(p.registration_date).toLocaleDateString() : '-'}</td>
                  <td className="py-3 px-4 text-sm">{p.name}</td>
                  <td className="py-3 px-4 text-sm">{p.type}</td>
                  <td className="py-3 px-4 text-sm">{p.contact}</td>
                  <td className="py-3 px-4 text-sm">{p.phone}</td>
                  <td className="py-3 px-4 text-sm">{p.email}</td>
                  <td className="py-3 px-4 text-sm">{p.address}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {p.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      className="text-sky-600 hover:text-sky-800 mr-3"
                      onClick={() => handleEdit(p)}
                      title="Editar"
                    >
                      <FaEdit className="inline text-lg" />
                    </button>
                    <button
                      className={`mr-3 ${p.is_active ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}`}
                      onClick={() => handleToggleActive(p)}
                      title={p.is_active ? 'Inactivar' : 'Activar'}
                    >
                      {p.is_active ? '🔒' : '✅'}
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(p)}
                      title="Eliminar"
                    >
                      <FaTrashAlt className="inline text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
              {proveedoresFiltrados.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center py-6 text-gray-500">
                    No se encontraron proveedores
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* 🧭 Botones de acción */}
      <div className="flex justify-between items-center mt-6 w-full">
  
        {/* ➕ Botón agregar */}
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-codecraftBlue hover:bg-sky-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Agregar Proveedor
        </button>

        {/* 📄 Botón exportar PDF */}
        <button
          onClick={exportToPDF}
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-2 rounded-lg transition"
        >
          📄 Exportar PDF
        </button>
      </div>



      {/* 🪟 Modal Agregar */}
      {showAddModal && (
        <Modal
          title="Agregar Proveedor"
          data={nuevoProveedor}
          onChange={handleChange}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateProveedor}
        />
      )}

      {/* ✏️ Modal Editar */}
      {showEditModal && proveedorAEditar && (
        <Modal
          title="Editar Proveedor"
          data={proveedorAEditar}
          onChange={handleEditChange}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateProveedor}
        />
      )}

      {/* 🗑️ Modal Eliminar */}
      {showDeleteModal && proveedorAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Eliminar Proveedor</h3>
            <p className="text-gray-700 mb-6">
              ¿Está seguro de eliminar al proveedor{" "}
              <strong>{proveedorAEliminar.name}</strong>?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🧱 Componente Modal (reutilizable para agregar/editar)
const Modal = ({ title, data, onChange, onClose, onSubmit }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: "Nombre", name: "name", required: true },
          { label: "Tipo", name: "type", type: "select", required: true },
          { label: "Contacto", name: "contact", required: true },
          { label: "Teléfono", name: "phone", required: true },
          { label: "Correo Electrónico", name: "email", required: true },
          { label: "Dirección", name: "address", required: true },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-semibold mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.type === "select" ? (
              <select
                name={field.name}
                value={data[field.name]}
                onChange={onChange}
                required={field.required}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-sky-300"
              >
                <option value="Nacional">Nacional</option>
                <option value="Internacional">Internacional</option>
              </select>
            ) : (
              <input
                type={field.name === "email" ? "email" : "text"}
                name={field.name}
                value={data[field.name]}
                onChange={onChange}
                required={field.required}
                placeholder={field.name === "email" ? "ejemplo@dominio.com" : ""}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition"
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
);

export default Proveedores;
