import React, { useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const Proveedores = () => {
  const [proveedores, setProveedores] = useState([
    {
      id: 1,
      fechaRegistro: "2025-03-10",
      nombre: "Distribuidora Andina",
      tipo: "Nacional",
      contacto: "Carlos Pérez",
      telefono: "3001234567",
      correo: "carlos@andina.com",
      direccion: "Cra 45 #30-22, Medellín",
    },
    {
      id: 2,
      fechaRegistro: "2025-04-05",
      nombre: "Importadora Global Ltda",
      tipo: "Internacional",
      contacto: "Anna Smith",
      telefono: "+1 555 789 6543",
      correo: "asmith@global.com",
      direccion: "Miami, USA",
    },
  ]);

  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [proveedorAEditar, setProveedorAEditar] = useState(null);
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null);

  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: "",
    tipo: "Nacional",
    contacto: "",
    telefono: "",
    correo: "",
    direccion: "",
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
    p.nombre,
    p.tipo,
    p.contacto,
    p.correo,
    p.direccion,
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
      p.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      p.contacto.toLowerCase().includes(filtroTexto.toLowerCase());
    const tipoCoincide =
      filtroTipo === "Todos" || p.tipo === filtroTipo;
    return textoCoincide && tipoCoincide;
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
  const handleCreateProveedor = () => {
    const nuevoId = proveedores.length > 0 ? proveedores[proveedores.length - 1].id + 1 : 1;
    const fecha = new Date().toISOString().split("T")[0];

    const proveedor = { id: nuevoId, fechaRegistro: fecha, ...nuevoProveedor };
    setProveedores([...proveedores, proveedor]);
    setShowAddModal(false);
    setNuevoProveedor({
      nombre: "",
      tipo: "Nacional",
      contacto: "",
      telefono: "",
      correo: "",
      direccion: "",
    });
  };

  // ✏️ Editar
  const handleEdit = (proveedor) => {
    setProveedorAEditar({ ...proveedor });
    setShowEditModal(true);
  };

  const handleUpdateProveedor = () => {
    setProveedores(
      proveedores.map((p) => (p.id === proveedorAEditar.id ? proveedorAEditar : p))
    );
    setShowEditModal(false);
    setProveedorAEditar(null);
  };

  // 🗑️ Eliminar
  const handleDelete = (proveedor) => {
    setProveedorAEliminar(proveedor);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setProveedores(proveedores.filter((p) => p.id !== proveedorAEliminar.id));
    setShowDeleteModal(false);
    setProveedorAEliminar(null);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <option value="Todos">Todos</option>
            <option value="Nacional">Nacional</option>
            <option value="Internacional">Internacional</option>
          </select>
        </div>
      </div>

      {/* 📋 Tabla de proveedores */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                {["ID", "Fecha", "Nombre", "Tipo", "Contacto", "Teléfono", "Correo", "Dirección", "Acciones"].map((col) => (
                  <th key={col} className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proveedoresFiltrados.map((p) => (
                <tr key={p.id} className="border-b border-gray-200">
                  <td className="py-3 px-4 text-sm">{p.id}</td>
                  <td className="py-3 px-4 text-sm">{p.fechaRegistro}</td>
                  <td className="py-3 px-4 text-sm">{p.nombre}</td>
                  <td className="py-3 px-4 text-sm">{p.tipo}</td>
                  <td className="py-3 px-4 text-sm">{p.contacto}</td>
                  <td className="py-3 px-4 text-sm">{p.telefono}</td>
                  <td className="py-3 px-4 text-sm">{p.correo}</td>
                  <td className="py-3 px-4 text-sm">{p.direccion}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      className="text-sky-600 hover:text-sky-800 mr-3"
                      onClick={() => handleEdit(p)}
                    >
                      <FaEdit className="inline text-lg" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(p)}
                    >
                      <FaTrashAlt className="inline text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
              {proveedoresFiltrados.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-gray-500">
                    No se encontraron proveedores
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
              <strong>{proveedorAEliminar.nombre}</strong>?
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
          { label: "Nombre", name: "nombre" },
          { label: "Tipo", name: "tipo", type: "select" },
          { label: "Contacto", name: "contacto" },
          { label: "Teléfono", name: "telefono" },
          { label: "Correo Electrónico", name: "correo" },
          { label: "Dirección", name: "direccion" },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-semibold mb-1">{field.label}</label>
            {field.type === "select" ? (
              <select
                name={field.name}
                value={data[field.name]}
                onChange={onChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-sky-300"
              >
                <option value="Nacional">Nacional</option>
                <option value="Internacional">Internacional</option>
              </select>
            ) : (
              <input
                type="text"
                name={field.name}
                value={data[field.name]}
                onChange={onChange}
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
