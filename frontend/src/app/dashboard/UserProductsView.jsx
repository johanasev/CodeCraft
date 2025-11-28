import React, { useState, useEffect, useMemo } from 'react';
import { inventoryService } from '../../api/inventoryService';
import { FaExclamationTriangle } from 'react-icons/fa';

const UserProductsView = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    category: '',
    reference: '',
    estado: 'Todos'
  });

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

  // Obtener categorías únicas para el filtro
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category || p.type).filter(Boolean)));
    return uniqueCategories.sort();
  }, [products]);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const isLowStock = product.is_low_stock || (product.quantity <= (product.minimum_stock || 10));

      if (filters.name && !product.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.category && (product.category || product.type) !== filters.category) return false;
      if (filters.reference && !product.reference.toLowerCase().includes(filters.reference.toLowerCase())) return false;
      if (filters.estado === 'Stock Bajo' && !isLowStock) return false;
      if (filters.estado === 'Normal' && isLowStock) return false;

      return true;
    });
  }, [products, filters]);

  return (
    <div className="min-h-screen p-8 bg-slate-200">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold text-gray-800">
          Gestión de Productos {!loading && `(${filteredProducts.length} productos)`}
        </h2>
        <div className="flex items-center text-sm font-semibold text-gray-600">
          <span>Sistema de Gestión de Inventarios</span>
          <span className="text-sky-600 ml-1">CodeCraft</span>
        </div>
      </div>

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
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-sky-300"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
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

      {/* Contenedor de la Tabla */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-lg p-0 relative max-h-[80vh] overflow-y-auto">
        <table className="min-w-full table-auto">
          {/* Cabecera de la tabla - Fija en el scroll */}
          <thead className="sticky top-0 bg-white shadow-md z-20">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">ID</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Fecha</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Nombre</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Categoría</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Referencia</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Talla</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Color</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Precio</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Proveedor</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Stock Mínimo</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Cantidad</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Estado</th>
            </tr>
          </thead>
          
          {/* Cuerpo de la tabla */}
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center py-6 text-gray-500">
                  No se encontraron productos con los filtros aplicados
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const isLowStock = product.is_low_stock || (product.quantity <= (product.minimum_stock || 10));
                return (
                  <tr key={product.id} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${isLowStock ? 'bg-red-50' : ''}`}>
                    <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">{product.id}</td>
                    <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">
                      {product.created_at ? new Date(product.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">{product.name}</td>
                    <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">{product.category}</td>
                    <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">{product.reference}</td>
                    <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">{product.size || '-'}</td>
                    <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">{product.color || '-'}</td>
                    <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">
                      ${product.price ? product.price.toLocaleString() : '0'}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">
                      {product.supplier_name || product.supplier || '-'}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">{product.minimum_stock || 10}</td>
                    <td className={`py-4 px-4 text-sm font-medium whitespace-nowrap ${isLowStock ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                      {product.quantity || 0}
                    </td>
                    <td className="py-4 px-4 text-sm whitespace-nowrap">
                      {isLowStock && (
                        <div className="flex items-center gap-1 text-red-600">
                          <FaExclamationTriangle />
                          <span className="font-semibold text-xs">Stock Bajo</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
};

export default UserProductsView;