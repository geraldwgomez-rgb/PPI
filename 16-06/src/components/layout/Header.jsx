function Header() {
  return <header className="header"><div className="header__logo">Sistema SMC</div></header>
}
export default Header

import React, { useState } from 'react';

function Header() {
  // Estados para controlar las secciones interactivas del sistema
  const [menuPerfilAbierto, setMenuPerfilAbierto] = useState(false);
  const [menuAlertasAbierto, setMenuAlertasAbierto] = useState(false);

  return (
    <header className="header bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-50 select-none">
      
      {/* Izquierda: Logo original integrado */}
      <div className="header__logo flex items-center space-x-3">
        <div className="bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
        </div>
        <div>
          <span className="text-lg font-bold text-gray-800 block leading-none">Sistema SMC</span>
          <span className="text-xs text-gray-500 font-medium">Módulo Contable</span>
        </div>
      </div>

      {/* Centro: Período e información contable de control */}
      <div className="header__period hidden md:flex items-center space-x-4 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Período Fiscal:</span>
        </div>
        <span className="text-sm font-bold text-gray-700">Junio 2026</span>
        <span className="text-gray-300">|</span>
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          Régimen Común
        </span>
      </div>

      {/* Derecha: Utilidades del sistema y perfil del contador */}
      <div className="header__actions flex items-center space-x-4">
        
        {/* Buscador de cuentas, NIT o comprobantes */}
        <button 
          className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          title="Buscar en el sistema..."
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Campana de Notificaciones / Desfases / Alertas */}
        <div className="relative">
          <button 
            onClick={() => { setMenuAlertasAbierto(!menuAlertasAbierto); setMenuPerfilAbierto(false); }}
            className={`text-gray-500 hover:text-gray-700 p-1.5 rounded-full transition-colors ${menuAlertasAbierto ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </button>

          {/* Menú desplegable de Alertas */}
          {menuAlertasAbierto && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100 font-semibold text-sm text-gray-700">
                Alertas del Sistema
              </div>
              <div className="px-4 py-3 hover:bg-gray-50 text-xs cursor-pointer border-b border-gray-50">
                <p className="font-medium text-amber-600">⚠️ Conciliación pendiente</p>
                <p className="text-gray-500 mt-0.5">Diferencia detectada en extracto bancario de $1,240,000.</p>
              </div>
              <div className="px-4 py-3 hover:bg-gray-50 text-xs cursor-pointer">
                <p className="font-medium text-blue-600">📄 Facturación electrónica</p>
                <p className="text-gray-500 mt-0.5">Nuevos comprobantes listos para validación y causación.</p>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200" />

        {/* Bloque del perfil de usuario */}
        <div className="relative">
          <div 
            onClick={() => { setMenuPerfilAbierto(!menuPerfilAbierto); setMenuAlertasAbierto(false); }}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="text-right hidden sm:block">
              <span className="text-sm font-semibold text-gray-700 block group-hover:text-blue-600 transition-colors">
                Carlos Mendoza
              </span>
              <span className="text-xs text-gray-400 block -mt-0.5">Contador General</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-blue-500 flex items-center justify-center font-bold text-sm text-blue-700 transition-transform group-hover:scale-105">
              SMC
            </div>
          </div>

          {/* Menú desplegable de perfil */}
          {menuPerfilAbierto && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Mi Configuración
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Cambiar de Empresa
              </button>
              <hr className="border-gray-100 my-1" />
              <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

