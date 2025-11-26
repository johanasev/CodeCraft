import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TransactionHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const transactions = location.state?.transactions || [];

  // 📅 Filtros
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [user, setUser] = useState("");

  // 🔍 Filtrar
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((trx) => {
        const trxDate = new Date(trx.date);
        if (startDate && trxDate < new Date(startDate)) return false;
        if (endDate && trxDate > new Date(endDate)) return false;
        if (type && trx.type !== type) return false;
        if (category && trx.product_name && !trx.product_name.toLowerCase().includes(category.toLowerCase())) return false;
        if (user && trx.user_email && !trx.user_email.toLowerCase().includes(user.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, startDate, endDate, type, category, user]);

  // 🧾 Exportar PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("CodeCraft – Sistema de Gestión de Inventarios", 14, 20);
    doc.setFontSize(11);
    const rangeText =
      startDate || endDate
        ? `Periodo: ${startDate || "Inicio"} - ${endDate || "Hoy"}`
        : "Periodo: Completo";
    doc.text(rangeText, 14, 28);

    const tableData = filteredTransactions.map((trx) => [
      trx.id,
      new Date(trx.date).toLocaleDateString(),
      trx.product_name || "-",
      trx.product_reference || "-",
      trx.type.toUpperCase(),
      trx.quantity,
      trx.user_email || `ID: ${trx.user}`,
      trx.supplier || "-",
    ]);

    autoTable(doc,{
      head: [
        [
          "ID",
          "Fecha",
          "Producto",
          "Referencia",
          "Tipo",
          "Cantidad",
          "Usuario",
          "Proveedor",
        ],
      ],
      body: tableData,
      startY: 35,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [60, 141, 188], textColor: 255, halign: "center" },
    });

    const filename =
      startDate || endDate
        ? `reporte-codecraft-${startDate || "inicio"}-${endDate || "hoy"}.pdf`
        : "reporte-codecraft-completo.pdf";

    doc.save(filename);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* 🧭 Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📊 Historial de Transacciones</h1>
        <button
          onClick={() => navigate("/admin/transactions")}
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
        >
          ← Volver a Transacciones
        </button>
      </div>

      <div className="text-sm text-gray-600 mb-8">
        Sistema de Gestión de Inventarios – <span className="font-semibold">CodeCraft</span>
      </div>

      {/* 🔍 Filtros */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Desde</label>
          <input type="date" className="w-full border p-2 rounded-lg" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hasta</label>
          <input type="date" className="w-full border p-2 rounded-lg" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select className="w-full border p-2 rounded-lg" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Todos</option>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Producto</label>
          <input type="text" className="w-full border p-2 rounded-lg" placeholder="Buscar producto" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Usuario</label>
          <input type="text" className="w-full border p-2 rounded-lg" placeholder="Buscar usuario" value={user} onChange={(e) => setUser(e.target.value)} />
        </div>
      </div>

      {/* 📁 Tabla */}
      <div className="bg-white rounded-xl shadow-lg p-6 max-h-[600px] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Resultados: {filteredTransactions.length}</h2>

        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No se encontraron transacciones en el rango seleccionado.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Producto</th>
                <th className="px-4 py-2 text-left">Referencia</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Cantidad</th>
                <th className="px-4 py-2 text-left">Usuario</th>
                <th className="px-4 py-2 text-left">Proveedor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{trx.id}</td>
                  <td className="px-4 py-2">{trx.date ? new Date(trx.date).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-2">{trx.product_name || "-"}</td>
                  <td className="px-4 py-2">{trx.product_reference || "-"}</td>
                  <td className="px-4 py-2">{trx.type ? trx.type.toUpperCase() : "-"}</td>
                  <td className="px-4 py-2">{trx.quantity}</td>
                  <td className="px-4 py-2">{trx.user_email || `ID: ${trx.user}`}</td>
                  <td className="px-4 py-2">{trx.supplier || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 📤 Exportar */}
      <div className="flex justify-end mt-6">
        <button onClick={exportToPDF} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-2 rounded-lg transition">
          📄 Exportar PDF
        </button>
      </div>
    </div>
  );
};

export default TransactionHistory;
