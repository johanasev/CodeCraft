import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { inventoryService } from '../../api/inventoryService';

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]; 


// Función auxiliar para generar el siguiente ID consecutivo (Necesaria para el Modal)
const generateNextId = (transactions) => {
  if (transactions.length === 0) {
    return 'TRX-001';
  }
  const lastId = transactions[transactions.length - 1].id;
  // Extraemos el número y le sumamos 1
  const parts = lastId.split('-'); 
  const number = parseInt(parts[1], 10); 
  const nextNumber = number + 1; 
  const nextIdNumber = String(nextNumber).padStart(3, '0');
  return `TRX-${nextIdNumber}`;
};


// --- LÓGICA DEL GRÁFICO (CALCULADA) ---
/**
 * Toma la lista de transacciones (filtradas) y genera la data para el gráfico por mes.
 */
const generateChartData = (transactions) => {
  // Inicializamos un mapa para guardar las sumas de ingresos y salidas por mes (Enero a Diciembre)
  const monthlyDataMap = Array(12).fill(0).map((_, index) => ({
    name: monthNames[index],
    Ingresos: 0,
    Salidas: 0,
  }));

  transactions.forEach(trx => {
    const date = new Date(trx.date);
    const monthIndex = date.getMonth();
    const transactionType = trx.transaction_type || trx.type;

    if (monthIndex >= 0 && monthIndex < 12) {
      if (transactionType === 'ENTRADA') {
        monthlyDataMap[monthIndex].Ingresos += trx.quantity || 0;
      } else if (transactionType === 'SALIDA') {
        monthlyDataMap[monthIndex].Salidas += trx.quantity || 0;
      }
    }
  });

  // Solo mostramos los meses que tuvieron actividad.
  return monthlyDataMap.filter(d => d.Ingresos > 0 || d.Salidas > 0);
};

// --- LÓGICA DE FILTROS INTERDEPENDIENTES ---
/**
 * Genera las opciones disponibles para los selectores basándose en los filtros aplicados.
 */
const getDependentFilters = (transactions, currentFilters) => {
  const getFilteredSet = (fieldToExclude) => {
    return transactions.filter(trx => {
      const product = trx.product_name || trx.product;
      const user = trx.user_name || trx.user;
      const reference = trx.reference;

      if (fieldToExclude !== 'product' && currentFilters.product && product !== currentFilters.product) return false;
      if (fieldToExclude !== 'user' && currentFilters.user && user !== currentFilters.user) return false;
      if (fieldToExclude !== 'reference' && currentFilters.reference && reference !== currentFilters.reference) return false;
      return true;
    });
  };

  const productSet = getFilteredSet('product');
  const userSet = getFilteredSet('user');
  const referenceSet = getFilteredSet('reference');

  return {
    products: Array.from(new Set(productSet.map(t => t.product_name || t.product).filter(Boolean))).sort(),
    users: Array.from(new Set(userSet.map(t => t.user_name || t.user).filter(Boolean))).sort(),
    references: Array.from(new Set(referenceSet.map(t => t.reference).filter(Boolean))).sort(),
  };
};

const UserTransactionsView = () => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getTransactions();
      setTransactions(Array.isArray(data) ? data : (data.results || []));
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Error al cargar transacciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await inventoryService.getProducts();
      setProducts(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await inventoryService.getSuppliers();
      setSuppliers(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };
  
  // Estado para guardar los valores de los filtros seleccionados
  const [filters, setFilters] = useState({
    product: '',
    user: '',
    reference: '',
  });

  // Calcula las opciones de filtro disponibles basándose en el estado actual de los filtros
  const dependentFilters = useMemo(() => 
    getDependentFilters(transactions, filters), 
    [transactions, filters]
  );

  // Manejador genérico para actualizar el estado de los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
  };

  // --- LÓGICA DE FILTRADO (useMemo) ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(trx => {
      const product = trx.product_name || trx.product;
      const user = trx.user_name || trx.user;
      const reference = trx.reference;

      if (filters.product && product !== filters.product) { return false; }
      if (filters.user && user !== filters.user) { return false; }
      if (filters.reference && reference !== filters.reference) { return false; }
      return true;
    });
  }, [transactions, filters]);

  // --- LÓGICA DE GRÁFICO (useMemo) ---
  const chartData = useMemo(() => generateChartData(filteredTransactions), [filteredTransactions]);

  // Función para determinar el estilo (color) basado en el tipo de transacción
  const getTypeBadge = (type) => {
    const isEntry = type === 'ENTRADA';
    return (
      <span 
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${isEntry ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`
        }
      >
        {type}
      </span>
    );
  };
  
  // Se eliminan los Handlers placeholder para las acciones (handleEdit, handleDelete)
  
  const [formData, setFormData] = useState({
    date: '',
    product: '',
    type: 'entrada',
    quantity: '',
    supplier: '',
    price: ''
  });


  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Transacciones de Inventario</h1>
        <div className="text-sm text-gray-500">
          Sistema de Gestión de Inventarios <span className="font-semibold text-sky-600">CodeCraft</span>
        </div>
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

      {/* Sección de Filtros */}
      {!loading && !error && (
      <div className="bg-white p-4 rounded-xl shadow-lg mb-6 flex flex-wrap gap-4">
        {/* Filtro por Producto */}
        <select 
          name="product" 
          onChange={handleFilterChange} 
          value={filters.product}
          className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition disabled:bg-gray-100"
        >
          <option value="">Filtrar por Producto</option>
          {/* Muestra solo los productos disponibles basados en otros filtros */}
          {dependentFilters.products.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        
        {/* Filtro por Usuario */}
        <select 
          name="user" 
          onChange={handleFilterChange} 
          value={filters.user}
          className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition disabled:bg-gray-100"
        >
          <option value="">Filtrar por Usuario</option>
          {/* Muestra solo los usuarios disponibles basados en otros filtros */}
          {dependentFilters.users.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        
        {/* Filtro por Referencia */}
        <select 
          name="reference" 
          onChange={handleFilterChange} 
          value={filters.reference}
          className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition disabled:bg-gray-100"
        >
          <option value="">Filtrar por Referencia</option>
          {/* Muestra solo las referencias disponibles basadas en otros filtros */}
          {dependentFilters.references.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      )}

      {/* Tabla de Historial de Transacciones */}
      {!loading && !error && (
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Historial de Transacciones ({filteredTransactions.length} resultados)</h2>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-sky-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-sky-700 transition-colors font-semibold"
            >
                Agregar Movimiento
            </button>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No se encontraron transacciones con los filtros aplicados.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Referencia</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tipo Transacción</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Cantidad</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Proveedor</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Realizado por</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Observación</th>
                {/* Se eliminó la columna de Acciones */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Iteramos sobre las transacciones FILTRADAS */}
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">{transaction.id}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                    {transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                    {transaction.product_name || transaction.product || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-left">{transaction.reference || '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-left">
                    {getTypeBadge(transaction.transaction_type || transaction.type)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-left">{transaction.quantity || 0}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-left">{transaction.supplier || '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                    {transaction.user_name || transaction.user || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs text-left">
                    {transaction.observation || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      )}

      {/* Gráfico de Resumen de Movimientos (Gráfica dinámica que usa los datos FILTRADOS) */}
      {!loading && !error && (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Resumen de Movimientos por Mes</h2>
        <div style={{ width: '100%', height: 300 }}>
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              No hay datos de movimientos para graficar con los filtros actuales.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#555" />
                <YAxis stroke="#555" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="Ingresos" fill="#10b981" name="Entradas (Ingresos)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Salidas" fill="#ef4444" name="Salidas (Egresos)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      )}

     {/* --- MODAL PARA AGREGAR MOVIMIENTO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Agregar Nuevo Movimiento</h2>
            
            {/* FORMULARIO */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                try {
                  const transactionData = {
                    product: parseInt(formData.product),
                    type: formData.type,
                    quantity: parseInt(formData.quantity),
                    supplier: formData.supplier || '',
                    price: parseFloat(formData.price) || 0
                  };

                  await inventoryService.createTransaction(transactionData);
                  await fetchTransactions();
                  setIsModalOpen(false);
                  setFormData({
                    date: '',
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
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Producto</label>
                <select
                  name="product"
                  value={formData.product}
                  onChange={(e) => setFormData({...formData, product: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                >
                  <option value="">Seleccionar producto</option>
                  {products.filter(p => p.is_active).map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.reference}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Transacción</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                  >
                    <option value="entrada">ENTRADA</option>
                    <option value="salida">SALIDA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cantidad</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    min="1"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Proveedor (opcional)</label>
                  <select
                    name="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                  >
                    <option value="">Seleccionar proveedor</option>
                    {suppliers.filter(s => s.is_active).map((supplier) => (
                      <option key={supplier.id} value={supplier.name}>
                        {supplier.name} - {supplier.type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Precio Unitario</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTransactionsView;