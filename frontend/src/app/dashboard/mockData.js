// Exporta la lista inicial de transacciones para poblar la tabla.
// Los datos del gráfico se calcularán directamente a partir de esta lista.
export const initialTransactions = [
  { id: 'TRX-001', date: '2025-01-15', product: 'Camisetas', type: 'ENTRADA', quantity: 150, user: 'Jane Doe', observation: 'Compra inicial de Colección Primavera', reference: 'ALGODON-BASICA-S/N' },
  { id: 'TRX-002', date: '2025-01-28', product: 'Jeans', type: 'SALIDA', quantity: 30, user: 'John Smith', observation: 'Despacho a sucursal Outlet', reference: 'SLIM-FIT-NEGRO' },
  { id: 'TRX-003', date: '2025-02-05', product: 'Chaquetas', type: 'ENTRADA', quantity: 50, user: 'Jane Doe', observation: 'Recepción de pedido urgente (Denim)', reference: 'DENIM-CLASICA-M' },
  { id: 'TRX-004', date: '2025-02-18', product: 'Vestidos', type: 'SALIDA', quantity: 20, user: 'Sarah Connor', observation: 'Venta online temporada San Valentín', reference: 'NOCHE-LISO-ROJO' },
  { id: 'TRX-005', date: '2025-03-01', product: 'Zapatos', type: 'ENTRADA', quantity: 100, user: 'John Smith', observation: 'Reposición de inventario de Sneakers', reference: 'SNEAKER-BLANCO-38' },
  { id: 'TRX-006', date: '2025-03-10', product: 'Camisetas', type: 'SALIDA', quantity: 5, user: 'Sarah Connor', observation: 'Retiro para sesión de fotos (Marketing)', reference: 'ALGODON-BASICA-S/N' },
  { id: 'TRX-007', date: '2025-04-04', product: 'Faldas', type: 'ENTRADA', quantity: 75, user: 'Jane Doe', observation: 'Nueva partida de telas estampadas', reference: 'MIDI-FLORAL-L' },
  { id: 'TRX-008', date: '2025-04-20', product: 'Jeans', type: 'SALIDA', quantity: 15, user: 'John Smith', observation: 'Venta minorista en tienda principal', reference: 'SLIM-FIT-NEGRO' },
  { id: 'TRX-009', date: '2025-04-22', product: 'Camisetas', type: 'ENTRADA', quantity: 25, user: 'Jane Doe', observation: 'Devolución de lote mayorista', reference: 'ALGODON-BASICA-S/N' },
  { id: 'TRX-010', date: '2025-05-10', product: 'Vestidos', type: 'SALIDA', quantity: 10, user: 'Sarah Connor', observation: 'Despacho a plataforma de e-commerce', reference: 'CASUAL-TIRANTES-XS' },
  { id: 'TRX-011', date: '2025-05-25', product: 'Zapatos', type: 'SALIDA', quantity: 40, user: 'John Smith', observation: 'Venta de cierre de temporada', reference: 'TACONES-CLASICOS-36' },
];

// Nombres de los meses para el eje X del gráfico
export const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Datos únicos para poblar los selectores de filtro
export const uniqueFilters = {
    products: Array.from(new Set(initialTransactions.map(t => t.product))).sort(),
    users: Array.from(new Set(initialTransactions.map(t => t.user))).sort(),
    references: Array.from(new Set(initialTransactions.map(t => t.reference))).sort(),
};
