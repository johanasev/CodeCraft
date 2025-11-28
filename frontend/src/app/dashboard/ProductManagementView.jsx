import React, { useState, useEffect, useMemo } from "react";
import { FaEdit, FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";
import { inventoryService } from "../../api/inventoryService";

const ProductManagementView = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productToEdit, setProductToEdit] = useState(null);

  const [filters, setFilters] = useState({
    name: '',
    type: '',
    reference: '',
    estado: 'Todos'
  });

  const [newProduct, setNewProduct] = useState({
    name: "",
    type: "",
    reference: "",
    size: "",
    description: "",
    price: "",
    quantity: "",
    minimum_stock: "10",
  });

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getProducts();
      setProducts(Array.isArray(data) ? data : (data.results || []));
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleCreateProduct = async () => {
    try {
      const productData = {
        name: newProduct.name,
        type: newProduct.type,
        reference: newProduct.reference,
        size: newProduct.size,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        quantity: parseInt(newProduct.quantity),
        minimum_stock: parseInt(newProduct.minimum_stock) || 10,
      };

      await inventoryService.createProduct(productData);
      await fetchProducts(); // Reload products
      setShowAddModal(false);
      setNewProduct({
        name: "",
        type: "",
        reference: "",
        size: "",
        description: "",
        price: "",
        quantity: "",
        minimum_stock: "10",
      });
    } catch (err) {
      console.error('Error creating product:', err);
      alert('Error al crear producto: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await inventoryService.deleteProduct(productToDelete.id);
      await fetchProducts(); // Reload products
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error al eliminar producto: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (product) => {
    setProductToEdit({ ...product });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setProductToEdit({ ...productToEdit, [name]: value });
  };

  const handleUpdateProduct = async () => {
    try {
      const productData = {
        name: productToEdit.name,
        type: productToEdit.type,
        reference: productToEdit.reference,
        size: productToEdit.size,
        description: productToEdit.description,
        price: parseFloat(productToEdit.price),
        quantity: parseInt(productToEdit.quantity),
        minimum_stock: parseInt(productToEdit.minimum_stock) || 10,
      };

      await inventoryService.updateProduct(productToEdit.id, productData);
      await fetchProducts(); // Reload products
      setShowEditModal(false);
      setProductToEdit(null);
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Error al actualizar producto: ' + (err.response?.data?.message || err.message));
    }
  };

  // Obtener tipos/categorías únicos para el filtro
  const productTypes = useMemo(() => {
    const uniqueTypes = Array.from(new Set(products.map(p => p.type).filter(Boolean)));
    return uniqueTypes.sort();
  }, [products]);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const isLowStock = product.is_low_stock || (product.quantity <= (product.minimum_stock || 10));

      if (filters.name && !product.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.type && product.type !== filters.type) return false;
      if (filters.reference && !product.reference.toLowerCase().includes(filters.reference.toLowerCase())) return false;
      if (filters.estado === 'Stock Bajo' && !isLowStock) return false;
      if (filters.estado === 'Normal' && isLowStock) return false;

      return true;
    });
  }, [products, filters]);

  return (
    <div className="min-h-screen p-8 bg-slate-200">
      {/* 🧑‍💻 Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold text-gray-800">
          Gestión de Productos {!loading && `(${filteredProducts.length} productos)`}
        </h2>
        <div className="flex items-center text-sm font-semibold text-gray-600">
          <span>Sistema de Gestión de Inventarios</span>
          <span className="text-sky-600 ml-1">CodeCraft</span>
        </div>
      </div>

      {/* Sección de Filtros */}
      {!loading && !error && (
        <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtro por Nombre */}
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filters.name}
              onChange={(e) => setFilters({...filters, name: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
            />

            {/* Filtro por Categoría */}
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
            >
              <option value="">Todas las categorías</option>
              {productTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Filtro por Referencia */}
            <input
              type="text"
              placeholder="Buscar por referencia..."
              value={filters.reference}
              onChange={(e) => setFilters({...filters, reference: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
            />

            {/* Filtro por Estado */}
            <select
              value={filters.estado}
              onChange={(e) => setFilters({...filters, estado: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
            >
              <option value="Todos">Todos</option>
              <option value="Stock Bajo">Stock Bajo</option>
              <option value="Normal">Stock Normal</option>
            </select>
          </div>
        </div>
      )}

      {/* ➕ Botón agregar */}
      <button
        onClick={() => setShowAddModal(true)}
        className="bg-codecraftBlue hover:bg-sky-700 text-white font-bold py-2 px-4 rounded mb-6 transition-colors block ml-0 text-left"
      >
        Agregar Producto
      </button>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-xl text-gray-600">Cargando productos...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* 📊 Tabla */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                {[
                  "ID",
                  "Nombre",
                  "Categoría",
                  "Referencia",
                  "Talla",
                  "Descripción",
                  "Precio",
                  "Stock Mínimo",
                  "Cantidad",
                  "Estado",
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
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-6 text-gray-500">
                    No se encontraron productos con los filtros aplicados
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLowStock = product.is_low_stock || (product.quantity <= (product.minimum_stock || 10));
                  return (
                  <tr key={product.id} className={`border-b border-gray-200 ${isLowStock ? 'bg-red-50' : ''}`}>
                    <td className="py-4 px-4 text-sm">{product.id}</td>
                    <td className="py-4 px-4 text-sm">{product.name}</td>
                    <td className="py-4 px-4 text-sm">{product.type}</td>
                    <td className="py-4 px-4 text-sm">{product.reference}</td>
                    <td className="py-4 px-4 text-sm">{product.size}</td>
                    <td className="py-4 px-4 text-sm">{product.description}</td>
                    <td className="py-4 px-4 text-sm">${parseFloat(product.price).toLocaleString()}</td>
                    <td className="py-4 px-4 text-sm">{product.minimum_stock || 10}</td>
                    <td className={`py-4 px-4 text-sm font-medium ${isLowStock ? 'text-red-600 font-bold' : ''}`}>
                      {product.quantity}
                    </td>
                    <td className="py-4 px-4 text-sm">
                      {isLowStock && (
                        <div className="flex items-center gap-1 text-red-600">
                          <FaExclamationTriangle />
                          <span className="font-semibold text-xs">Stock Bajo</span>
                        </div>
                      )}
                    </td>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* 🪟 Modal Agregar */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl relative">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Agregar Nuevo Producto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-1">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={newProduct.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Categoría</label>
                <select
                  name="type"
                  value={newProduct.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="camisas">Camisas</option>
                  <option value="pantalones">Pantalones</option>
                  <option value="vestidos">Vestidos</option>
                  <option value="zapatos">Zapatos</option>
                  <option value="accesorios">Accesorios</option>
                  <option value="ropa_interior">Ropa Interior</option>
                  <option value="deportiva">Ropa Deportiva</option>
                  <option value="abrigos">Abrigos y Chaquetas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Referencia</label>
                <input
                  type="text"
                  name="reference"
                  value={newProduct.reference}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Talla</label>
                <select
                  name="size"
                  value={newProduct.size}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                >
                  <option value="">Seleccionar talla</option>
                  <option value="XS">XS - Extra Pequeño</option>
                  <option value="S">S - Pequeño</option>
                  <option value="M">M - Mediano</option>
                  <option value="L">L - Grande</option>
                  <option value="XL">XL - Extra Grande</option>
                  <option value="XXL">XXL - Doble Extra Grande</option>
                  <option value="UNICA">Talla Única</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Precio</label>
                <input
                  type="number"
                  name="price"
                  value={newProduct.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Cantidad Inicial</label>
                <input
                  type="number"
                  name="quantity"
                  value={newProduct.quantity}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Stock Mínimo</label>
                <input
                  type="number"
                  name="minimum_stock"
                  value={newProduct.minimum_stock}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1">Descripción</label>
                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-1">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={productToEdit.name}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Categoría</label>
                <select
                  name="type"
                  value={productToEdit.type}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="camisas">Camisas</option>
                  <option value="pantalones">Pantalones</option>
                  <option value="vestidos">Vestidos</option>
                  <option value="zapatos">Zapatos</option>
                  <option value="accesorios">Accesorios</option>
                  <option value="ropa_interior">Ropa Interior</option>
                  <option value="deportiva">Ropa Deportiva</option>
                  <option value="abrigos">Abrigos y Chaquetas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Referencia</label>
                <input
                  type="text"
                  name="reference"
                  value={productToEdit.reference}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Talla</label>
                <select
                  name="size"
                  value={productToEdit.size}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                >
                  <option value="">Seleccionar talla</option>
                  <option value="XS">XS - Extra Pequeño</option>
                  <option value="S">S - Pequeño</option>
                  <option value="M">M - Mediano</option>
                  <option value="L">L - Grande</option>
                  <option value="XL">XL - Extra Grande</option>
                  <option value="XXL">XXL - Doble Extra Grande</option>
                  <option value="UNICA">Talla Única</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Precio</label>
                <input
                  type="number"
                  name="price"
                  value={productToEdit.price}
                  onChange={handleEditChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Cantidad</label>
                <input
                  type="number"
                  name="quantity"
                  value={productToEdit.quantity}
                  onChange={handleEditChange}
                  min="0"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Stock Mínimo</label>
                <input
                  type="number"
                  name="minimum_stock"
                  value={productToEdit.minimum_stock || 10}
                  onChange={handleEditChange}
                  min="0"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1">Descripción</label>
                <textarea
                  name="description"
                  value={productToEdit.description}
                  onChange={handleEditChange}
                  rows="3"
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
