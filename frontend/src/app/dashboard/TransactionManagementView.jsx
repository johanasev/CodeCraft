import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { inventoryService } from '../../api/inventoryService';

const TransactionManagementView = () => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const [newTransaction, setNewTransaction] = useState({
    product: '',
    type: 'entrada',
    quantity: '',
    supplier: '',
    price: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsData, productsData] = await Promise.all([
        inventoryService.getTransactions(),
        inventoryService.getProducts()
      ]);

      setTransactions(Array.isArray(transactionsData) ? transactionsData : (transactionsData.results || []));
      setProducts(Array.isArray(productsData) ? productsData : (productsData.results || []));
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar transacciones');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({ ...newTransaction, [name]: value });
  };

  const handleCreateTransaction = async () => {
    try {
      const transactionData = {
        product: parseInt(newTransaction.product),
        type: newTransaction.type,
        quantity: parseInt(newTransaction.quantity),
        supplier: newTransaction.supplier || '',
        price: parseFloat(newTransaction.price) || 0
      };

      await inventoryService.createTransaction(transactionData);
      await fetchData(); // Reload data
      setShowAddModal(false);
      setNewTransaction({
        product: '',
        type: 'entrada',
        quantity: '',
        supplier: '',
        price: ''
      });
    } catch (err) {
      console.error('Error creating transaction:', err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || JSON.stringify(err.response?.data) || err.message;
      alert('Error al crear transacción: ' + errorMsg);
    }
  };

  const handleDelete = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await inventoryService.deleteTransaction(transactionToDelete.id);
      await fetchData(); // Reload data
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Error al eliminar transacción: ' + (err.response?.data?.message || err.message));
    }
  };

  const getTypeBadge = (type) => {
    const isEntry = type === 'entrada';
    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
          ${isEntry ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
      >
        {type.toUpperCase()}
      </span>
    );
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : `ID: ${productId}`;
  };

  return (
    <div className="min-h-screen p-8 bg-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold text-gray-800">Gestión de Transacciones</h2>
        <div className="flex items-center text-sm font-semibold text-gray-600">
          <span>Sistema de Gestión de Inventarios</span>
          <span className="text-sky-600 ml-1">CodeCraft</span>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="bg-codecraftBlue hover:bg-sky-700 text-white font-bold py-2 px-4 rounded mb-6 transition-colors"
      >
        Registrar Transacción
      </button>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-xl text-gray-600">Cargando transacciones...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  {["ID", "Fecha", "Producto", "Tipo", "Cantidad", "Proveedor", "Precio", "Usuario", "Acciones"].map((col) => (
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
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-200">
                    <td className="py-4 px-4 text-sm">{transaction.id}</td>
                    <td className="py-4 px-4 text-sm">
                      {transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-4 px-4 text-sm">{getProductName(transaction.product)}</td>
                    <td className="py-4 px-4 text-sm">{getTypeBadge(transaction.type)}</td>
                    <td className="py-4 px-4 text-sm">{transaction.quantity}</td>
                    <td className="py-4 px-4 text-sm">{transaction.supplier || '-'}</td>
                    <td className="py-4 px-4 text-sm">${parseFloat(transaction.price || 0).toLocaleString()}</td>
                    <td className="py-4 px-4 text-sm">
                      {transaction.user_email || `ID: ${transaction.user}`}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(transaction)}
                      >
                        <FaTrash className="inline text-lg" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Registrar Nueva Transacción</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-1">Producto</label>
                <select
                  name="product"
                  value={newTransaction.product}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                >
                  <option value="">Seleccionar producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.reference}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Tipo de Transacción</label>
                <select
                  name="type"
                  value={newTransaction.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                >
                  <option value="entrada">ENTRADA</option>
                  <option value="salida">SALIDA</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Cantidad</label>
                <input
                  type="number"
                  name="quantity"
                  value={newTransaction.quantity}
                  onChange={handleChange}
                  min="1"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Proveedor (opcional)</label>
                <input
                  type="text"
                  name="supplier"
                  value={newTransaction.supplier}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Precio Unitario</label>
                <input
                  type="number"
                  name="price"
                  value={newTransaction.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
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
                onClick={handleCreateTransaction}
                className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && transactionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Eliminar Transacción</h3>
            <p className="text-gray-700 mb-6">
              ¿Está seguro de eliminar la transacción <strong>#{transactionToDelete.id}</strong>?
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

export default TransactionManagementView;
