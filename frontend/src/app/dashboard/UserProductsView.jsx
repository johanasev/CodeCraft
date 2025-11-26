import React from 'react';

const UserProductsView = () => {
  // Datos de ejemplo para la tabla de productos
  // NOTA: En una aplicación real, estos datos se obtendrían de Firestore.
  const products = [
    { id: '1', date: '2025-01-10', name: 'Camiseta Deportiva', category: 'Ropa', reference: 'REF-001', size: 'M', color: 'Azul', price: '$30000', supplier: 'Proveedor A', quantity: 50 },
    { id: '2', date: '2025-02-05', name: 'Zapatos Running', category: 'Calzado', reference: 'REF-002', size: '42', color: 'Negro', price: '$120000', supplier: 'Proveedor B', quantity: 20 },
    { id: '3', date: '2025-03-15', name: 'Pantalón Casual', category: 'Ropa', reference: 'REF-003', size: 'L', color: 'Gris', price: '$55000', supplier: 'Proveedor C', quantity: 75 },
    { id: '4', date: '2025-04-01', name: 'Chaqueta Impermeable', category: 'Ropa', reference: 'REF-004', size: 'XL', color: 'Rojo', price: '$150000', supplier: 'Proveedor A', quantity: 15 },
    { id: '5', date: '2025-05-20', name: 'Botas de Trabajo', category: 'Calzado', reference: 'REF-005', size: '40', color: 'Marrón', price: '$85000', supplier: 'Proveedor D', quantity: 40 },
    { id: '6', date: '2025-06-10', name: 'Calcetines Deportivos', category: 'Accesorios', reference: 'REF-006', size: 'S', color: 'Blanco', price: '$5000', supplier: 'Proveedor C', quantity: 120 },
    { id: '7', date: '2025-07-25', name: 'Gorra de Sol', category: 'Accesorios', reference: 'REF-007', size: 'Única', color: 'Verde', price: '$20000', supplier: 'Proveedor B', quantity: 30 },
    { id: '8', date: '2025-08-01', name: 'Jersey Térmico', category: 'Ropa', reference: 'REF-008', size: 'M', color: 'Azul Oscuro', price: '$90000', supplier: 'Proveedor D', quantity: 60 },
    // Agregamos más datos para forzar el scroll
    { id: '9', date: '2025-09-01', name: 'Shorts de Natación', category: 'Ropa', reference: 'REF-009', size: 'L', color: 'Azul Claro', price: '$45000', supplier: 'Proveedor A', quantity: 25 },
    { id: '10', date: '2025-10-10', name: 'Mochila de Viaje', category: 'Accesorios', reference: 'REF-010', size: 'Grande', color: 'Negro', price: '$180000', supplier: 'Proveedor C', quantity: 10 },
    { id: '11', date: '2025-11-20', name: 'Tenis de Montaña', category: 'Calzado', reference: 'REF-011', size: '44', color: 'Café', price: '$140000', supplier: 'Proveedor B', quantity: 35 },
    { id: '12', date: '2025-12-05', name: 'Bufanda de Lana', category: 'Accesorios', reference: 'REF-012', size: 'Única', color: 'Beige', price: '$35000', supplier: 'Proveedor D', quantity: 50 },
  ];

  return (
    <div className="min-h-screen p-8 bg-slate-200">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold text-gray-800">Gestión de Productos</h2>
        <div className="flex items-center text-sm font-semibold text-gray-600">
          <span>Sistema de Gestión de Inventarios</span>
          <span className="text-sky-600 ml-1">CodeCraft</span>
        </div>
      </div>
      
      {/* Contenedor de la Tabla */}
      {/* Usamos max-h-[80vh] y overflow-y-auto para permitir el scroll vertical
          si la tabla es muy larga, manteniendo el encabezado fijo en la parte superior. */}
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
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Cantidad</th>
            </tr>
          </thead>
          
          {/* Cuerpo de la tabla */}
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">{product.id}</td>
                <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">{product.date}</td>
                <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">{product.name}</td>
                <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">{product.category}</td>
                <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">{product.reference}</td>
                <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">{product.size}</td>
                <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">{product.color}</td>
                <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">{product.price}</td>
                <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">{product.supplier}</td>
                <td className="py-4 px-4 text-sm text-gray-700 font-medium whitespace-nowrap">{product.quantity}</td>
                {/* NOTA: No hay botones de Editar/Eliminar, ya que es una vista de solo lectura */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserProductsView;