import React, { useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const ProductManagementView = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      creationDate: "2025-01-10",
      name: "Camiseta Deportiva",
      category: "Ropa",
      reference: "REF-001",
      size: "M",
      color: "Azul",
      price: 30000,
      provider: "Proveedor A",
      quantity: 50,
    },
    {
      id: 2,
      creationDate: "2025-02-05",
      name: "Zapatos Running",
      category: "Calzado",
      reference: "REF-002",
      size: "42",
      color: "Negro",
      price: 120000,
      provider: "Proveedor B",
      quantity: 20,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productToEdit, setProductToEdit] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    reference: "",
    size: "",
    color: "",
    price: "",
    provider: "",
    quantity: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleCreateProduct = () => {
    const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;
    const today = new Date().toISOString().split("T")[0];

    const productToAdd = {
      id: newId,
      creationDate: today,
      ...newProduct,
      price: parseFloat(newProduct.price),
      quantity: parseInt(newProduct.quantity),
    };

    setProducts([...products, productToAdd]);
    setShowAddModal(false);
    setNewProduct({
      name: "",
      category: "",
      reference: "",
      size: "",
      color: "",
      price: "",
      provider: "",
      quantity: "",
    });
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setProducts(products.filter((p) => p.id !== productToDelete.id));
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleEdit = (product) => {
    setProductToEdit({ ...product });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setProductToEdit({ ...productToEdit, [name]: value });
  };

  const handleUpdateProduct = () => {
    setProducts(
      products.map((p) => (p.id === productToEdit.id ? productToEdit : p))
    );
    setShowEditModal(false);
    setProductToEdit(null);
  };

  return (
    <div className="min-h-screen p-8 bg-slate-200">
      {/* 🧑‍💻 Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold text-gray-800">Gestión de Productos</h2>
        <div className="flex items-center text-sm font-semibold text-gray-600">
          <span>Sistema de Gestión de Inventarios</span>
          <span className="text-sky-600 ml-1">CodeCraft</span>
        </div>
      </div>

      {/* ➕ Botón agregar */}
      <button
        onClick={() => setShowAddModal(true)}
        className="bg-codecraftBlue hover:bg-sky-700 text-white font-bold py-2 px-4 rounded mb-6 transition-colors block ml-0 text-left"
      >
        Agregar Producto
      </button>

      {/* 📊 Tabla */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                {[
                  "ID",
                  "Fecha",
                  "Nombre",
                  "Categoría",
                  "Referencia",
                  "Talla",
                  "Color",
                  "Precio",
                  "Proveedor",
                  "Cantidad",
                  "Acciones",
                ].map((col) => (
                  <th
                    key={col}
                    className={`py-3 px-4 text-left text-sm font-semibold text-gray-600 ${
                      col === "Acciones" ? "text-right" : ""
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-200">
                  <td className="py-4 px-4 text-sm">{product.id}</td>
                  <td className="py-4 px-4 text-sm">{product.creationDate}</td>
                  <td className="py-4 px-4 text-sm">{product.name}</td>
                  <td className="py-4 px-4 text-sm">{product.category}</td>
                  <td className="py-4 px-4 text-sm">{product.reference}</td>
                  <td className="py-4 px-4 text-sm">{product.size}</td>
                  <td className="py-4 px-4 text-sm">{product.color}</td>
                  <td className="py-4 px-4 text-sm">${product.price}</td>
                  <td className="py-4 px-4 text-sm">{product.provider}</td>
                  <td className="py-4 px-4 text-sm">{product.quantity}</td>
                  <td className="py-4 px-4 text-right">
                    <button
                      className="text-sky-600 hover:text-sky-800 mr-3"
                      onClick={() => handleEdit(product)}
                    >
                      <FaEdit className="inline text-lg" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(product)}
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

      {/* 🪟 Modal Agregar */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl relative">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Agregar Nuevo Producto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Nombre", name: "name" },
                { label: "Categoría", name: "category" },
                { label: "Referencia", name: "reference" },
                { label: "Talla", name: "size" },
                { label: "Color", name: "color" },
                { label: "Precio", name: "price", type: "number" },
                { label: "Proveedor", name: "provider" },
                { label: "Cantidad Inicial", name: "quantity", type: "number" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-semibold mb-1">{field.label}</label>
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={newProduct[field.name]}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProduct}
                className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition"
              >
                Crear Producto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ Modal Editar */}
      {showEditModal && productToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl relative">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Editar Producto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Nombre", name: "name" },
                { label: "Categoría", name: "category" },
                { label: "Referencia", name: "reference" },
                { label: "Talla", name: "size" },
                { label: "Color", name: "color" },
                { label: "Precio", name: "price", type: "number" },
                { label: "Proveedor", name: "provider" },
                { label: "Cantidad", name: "quantity", type: "number" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-semibold mb-1">{field.label}</label>
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={productToEdit[field.name]}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateProduct}
                className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ Modal Eliminar */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Eliminar Producto</h3>
            <p className="text-gray-700 mb-6">
              ¿Está seguro de eliminar el producto{" "}
              <strong>{productToDelete.name || productToDelete.reference}</strong>?
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

export default ProductManagementView;
