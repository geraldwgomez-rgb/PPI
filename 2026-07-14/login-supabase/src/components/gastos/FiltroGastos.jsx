import React, { useState } from 'react';

export default function FiltroGastos({ onFiltrar }) {
  // Estado para almacenar todos los criterios de búsqueda
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    fechaInicio: '',
    fechaFin: '',
    montoMin: '',
    montoMax: ''
  });

  // Manejador genérico de cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    const nuevosFiltros = {
      ...filtros,
      [name]: value
    };
    
    setFiltros(nuevosFiltros);
    
    // Notifica al componente padre los filtros actualizados
    if (onFiltrar) {
      onFiltrar(nuevosFiltros);
    }
  };

  // Limpia todos los campos del filtro
  const handleReset = () => {
    const filtrosLimpios = {
      busqueda: '',
      categoria: '',
      fechaInicio: '',
      fechaFin: '',
      montoMin: '',
      montoMax: ''
    };
    setFiltros(filtrosLimpios);
    if (onFiltrar) {
      onFiltrar(filtrosLimpios);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <span>🔍</span> Filtrar y Buscar Gastos
        </h3>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Grid de Controles del Filtro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        
        {/* 1. Búsqueda por concepto / proveedor */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Buscar Concepto / Proveedor
          </label>
          <input
            type="text"
            name="busqueda"
            className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Ej: Factura luz, Papelería..."
            value={filtros.busqueda}
            onChange={handleChange}
          />
        </div>

        {/* 2. Categoría Contable */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Categoría
          </label>
          <select
            name="categoria"
            className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            value={filtros.categoria}
            onChange={handleChange}
          >
            <option value="">Todas las categorías</option>
            <option value="servicios">Servicios Públicos</option>
            <option value="nomina">Nómina y Salarios</option>
            <option value="proveedores">Compra de Insumos</option>
            <option value="arriendo">Arrendamientos</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="impuestos">Impuestos / Tasas</option>
            <option value="otros">Otros Gastos</option>
          </select>
        </div>

        {/* 3. Fecha Desde */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Fecha Desde
          </label>
          <input
            type="date"
            name="fechaInicio"
            className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={filtros.fechaInicio}
            onChange={handleChange}
          />
        </div>

        {/* 4. Fecha Hasta */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Fecha Hasta
          </label>
          <input
            type="date"
            name="fechaFin"
            className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={filtros.fechaFin}
            onChange={handleChange}
          />
        </div>

        {/* 5. Monto Máximo (o Rango de precio) */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Monto Máximo ($)
          </label>
          <input
            type="number"
            name="montoMax"
            className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Ej: 500000"
            value={filtros.montoMax}
            onChange={handleChange}
          />
        </div>

      </div>
    </div>
  );
}
