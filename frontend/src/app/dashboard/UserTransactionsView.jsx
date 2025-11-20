import React, { useState, useMemo } from 'react';
// Se eliminan los imports de useNavigate, FaEdit, FaTrash.
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// NOTA: Se asume que mockData.js con initialTransactions, monthNames, y uniqueFilters está disponible.
// Si no, puedes copiar las variables y funciones de utilidades al inicio de este archivo, como en el ejemplo anterior.
import { initialTransactions, monthNames } from './mockData'; 


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
    
    if (monthIndex >= 0 && monthIndex < 12) {
      if (trx.type === 'ENTRADA') {
        monthlyDataMap[monthIndex].Ingresos += trx.quantity;
      } else if (trx.type === 'SALIDA') {
        monthlyDataMap[monthIndex].Salidas += trx.quantity;
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
      if (fieldToExclude !== 'product' && currentFilters.product && trx.product !== currentFilters.product) return false;
      if (fieldToExclude !== 'user' && currentFilters.user && trx.user !== currentFilters.user) return false;
      if (fieldToExclude !== 'reference' && currentFilters.reference && trx.reference !== currentFilters.reference) return false;
      return true;
    });
  };

  const productSet = getFilteredSet('product');
  const userSet = getFilteredSet('user');
  const referenceSet = getFilteredSet('reference');

  return {
    products: Array.from(new Set(productSet.map(t => t.product))).sort(),
    users: Array.from(new Set(userSet.map(t => t.user))).sort(),
    references: Array.from(new Set(referenceSet.map(t => t.reference))).sort(),
  };
};

const UserTransactionsView = () => {
  // Estado principal de todas las transacciones (la base de datos simulada)
  // Se eliminó la dependencia de useNavigate.
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal
  
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
      if (filters.product && trx.product !== filters.product) { return false; }
      if (filters.user && trx.user !== filters.user) { return false; }
      if (filters.reference && trx.reference !== filters.reference) { return false; }
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
    reference: '',
    type: 'ENTRADA',
    quantity: '',
    user: '',
    observation: ''
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

      {/* Sección de Filtros */}
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

      {/* Tabla de Historial de Transacciones */}
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
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Realizado por</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Observación</th>
                {/* Se eliminó la columna de Acciones */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Iteramos sobre las transacciones FILTRADAS */}
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  {/* Alineación a la izquierda en los TD */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">{transaction.id}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-left">{transaction.date}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-left">{transaction.product}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-left">{transaction.reference}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-left">
                    {getTypeBadge(transaction.type)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-left">{transaction.quantity}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-left">{transaction.user}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs text-left">{transaction.observation}</td>
                  {/* Se eliminó la celda de Acciones */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Se eliminó la sección de botones de Acción, dejando solo el botón Agregar Movimiento
        que ahora está en el encabezado de la tabla para mejor layout.
      */}
      
      {/* Gráfico de Resumen de Movimientos (Gráfica dinámica que usa los datos FILTRADOS) */}
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
      
     {/* --- MODAL PARA AGREGAR MOVIMIENTO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Agregar Nuevo Movimiento</h2>
            
            {/* FORMULARIO */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                // Crear nuevo objeto de transacción
                const newTransaction = {
                  id: generateNextId(transactions),
                  date: formData.date || new Date().toISOString().slice(0, 10),
                  product: formData.product,
                  reference: formData.reference,
                  type: formData.type,
                  quantity: Number(formData.quantity),
                  user: formData.user,
                  observation: formData.observation,
                };
                
                // Actualizar el estado
                setTransactions([...transactions, newTransaction]);
                setIsModalOpen(false);
                setFormData({ // limpiar campos
                  date: '',
                  product: '',
                  reference: '',
                  type: 'ENTRADA',
                  quantity: '',
                  user: '',
                  observation: ''
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Producto</label>
                  <input 
                    type="text" 
                    value={formData.product}
                    onChange={(e) => setFormData({...formData, product: e.target.value})}
                    required
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Referencia</label>
                  <input 
                    type="text" 
                    value={formData.reference}
                    onChange={(e) => setFormData({...formData, reference: e.target.value})}
                    required
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="ENTRADA">ENTRADA</option>
                    <option value="SALIDA">SALIDA</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cantidad</label>
                  <input 
                    type="number" 
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    required
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Usuario</label>
                  <input 
                    type="text" 
                    value={formData.user}
                    onChange={(e) => setFormData({...formData, user: e.target.value})}
                    required
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observación</label>
                <textarea 
                  value={formData.observation}
                  onChange={(e) => setFormData({...formData, observation: e.target.value})}
                  className="w-full border rounded-lg p-2"
                />
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