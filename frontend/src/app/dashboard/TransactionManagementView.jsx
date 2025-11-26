import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaChartBar, FaChartLine } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { inventoryService } from '../../api/inventoryService';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const TransactionManagementView = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [showCharts, setShowCharts] = useState(false);
  const [chartData, setChartData] = useState({
    trends: [],
    byType: [],
    inventory: []
  });

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

  // Fetch chart data when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      fetchChartData();
    }
  }, [transactions]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsData, productsData, suppliersData] = await Promise.all([
        inventoryService.getTransactions(),
        inventoryService.getProducts(),
        inventoryService.getSuppliers()
      ]);

      setTransactions(Array.isArray(transactionsData) ? transactionsData : (transactionsData.results || []));
      setProducts(Array.isArray(productsData) ? productsData : (productsData.results || []));
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : (suppliersData.results || []));
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar transacciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const [inventoryData] = await Promise.all([
        inventoryService.getInventoryOverviewChart()
      ]);

      // Procesar datos para gráficas locales basadas en transacciones
      const processedData = processTransactionData();

      setChartData({
        trends: processedData.trends,
        byType: processedData.byType,
        inventory: inventoryData || []
      });
    } catch (err) {
      console.error('Error fetching chart data:', err);
    }
  };

  const processTransactionData = () => {
    if (!transactions.length) return { trends: [], byType: [] };

    // Agrupar transacciones por tipo
    const typeData = transactions.reduce((acc, transaction) => {
      const type = transaction.type === 'entrada' ? 'Entradas' : 'Salidas';
      if (!acc[type]) {
        acc[type] = { name: type, count: 0, value: 0 };
      }
      acc[type].count += 1;
      acc[type].value += transaction.quantity || 0;
      return acc;
    }, {});

    // Agrupar transacciones por fecha
    const dateData = transactions.reduce((acc, transaction) => {
      if (!transaction.date) return acc;

      const date = new Date(transaction.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, entradas: 0, salidas: 0 };
      }

      if (transaction.type === 'entrada') {
        acc[date].entradas += transaction.quantity || 0;
      } else {
        acc[date].salidas += transaction.quantity || 0;
      }
      return acc;
    }, {});

    return {
      trends: Object.values(dateData).slice(-10), // Últimos 10 días
      byType: Object.values(typeData)
    };
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

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-codecraftBlue hover:bg-sky-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Registrar Transacción
        </button>
        <button
          onClick={() => navigate('/admin/transactions/history', {
            state: { transactions }
          })}
          className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Ver Historial
        </button>
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center gap-2"
        >
          <FaChartBar />
          {showCharts ? 'Ocultar Gráficas' : 'Ver Gráficas'}
        </button>
      </div>

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

      {/* Statistics Cards */}
      {showCharts && !loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Entradas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {transactions.filter(t => t.type === 'entrada').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Salidas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {transactions.filter(t => t.type === 'salida').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transacciones</p>
                <p className="text-2xl font-semibold text-gray-900">{transactions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cantidad Total</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {transactions.reduce((sum, t) => sum + (t.quantity || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {showCharts && !loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfica de Transacciones por Tipo */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <FaChartBar className="text-blue-600" />
              Transacciones por Tipo
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.byType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.byType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfica de Tendencias */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <FaChartLine className="text-green-600" />
              Tendencia de Transacciones
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="entradas" stroke="#22c55e" strokeWidth={2} name="Entradas" />
                <Line type="monotone" dataKey="salidas" stroke="#ef4444" strokeWidth={2} name="Salidas" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfica de Inventario */}
          {chartData.inventory.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <FaChartBar className="text-purple-600" />
                Niveles de Inventario por Producto
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.inventory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="#8b5cf6" name="Cantidad en Stock" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
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
                <select
                  name="supplier"
                  value={newTransaction.supplier}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                >
                  <option value="">Seleccionar proveedor</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.name}>
                      {supplier.name} - {supplier.type}
                    </option>
                  ))}
                </select>
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
