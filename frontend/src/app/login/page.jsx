// src/app/login/page.jsx

import React from 'react';

const LoginPage = () => {
  return (
    <div className="relative w-screen h-screen flex flex-col justify-center items-center">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/backgr.png')" }}></div>

      {/* Overlay con opacidad */}
      <div className="absolute inset-0 bg-white opacity-30"></div>

      {/* Contenido centrado */}
      <div className="relative z-10 text-codecraftBlue text-center">
        <h1 className="text-6xl font-bold mb-4">CodeCraft</h1>
        <p className="text-2xl mb-8 font-semibold text-slate-800">Sistema de Gestión de Inventario</p>
        <button className="bg-codecraftBlue hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 ease-in-out">
          Iniciar Sesión
        </button>
      </div>

      {/* Footer "Created By Codecraft" */}
      <div className="absolute bottom-4 text-slate-800 text-sm z-20">
        <p>Created By Codecraft</p>
      </div>
    </div>
  );
};

export default LoginPage;