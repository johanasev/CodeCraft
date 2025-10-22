import React from 'react';
import { Link } from 'react-router-dom';

const WelcomePage = () => {
  return (
    <div className="relative w-screen h-screen flex flex-col justify-center items-center px-4 sm:px-8 md:px-16">
      {/* Background Image */}
      <div className="fixed inset-0 bg-cover bg-center z-0" style={{ backgroundImage: "url('/backgr.png')" }}></div>

      {/* Overlay con opacidad */}
      <div className="fixed inset-0  z-0"></div>

      {/* Contenido centrado */}
      <div className="relative z-10 text-codecraftBlue text-center">
        {/* Título: tamaño responsivo */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 md:mb-4">CodeCraft</h1>
        
        {/* Subtítulo: tamaño y márgenes responsivos */}
        <p className="text-xl sm:text-2xl mb-6 md:mb-8 text-slate-800 font-semibold">Sistema de Gestión de Inventario</p>
        
        {/* Botón: tamaño de padding responsivo */}
        <Link to="/login" className="inline-block bg-codecraftBlue hover:bg-sky-500 hover:text-white text-white font-bold py-2 px-6 rounded-md transition duration-300 ease-in-out">
          Iniciar Sesión
        </Link>
      </div>

      {/* Footer "Created By Codecraft" */}
      <div className="fixed bottom-4 text-slate-800 text-sm z-20 px-4">
        <p>Creado por Codecraft</p>
      </div>
    </div>
  );
};

export default WelcomePage;
