// src/app/login/LoginPage.jsx

import React from 'react';
import LoginForm from '../../components/LoginForm.jsx';

const LoginPage = () => {
  return (
  <div className="fixed inset-0 flex flex-col justify-center items-center">
      {/* Background Image and Overlay */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/backgr.png')" }}></div>
      <div className="absolute inset-0 z-0"></div>

      {/* Contenido centrado: Título y Formulario */}
      <div className="relative z-10 text-codecraftBlue text-center">
        <h2 className="text-6xl font-bold mb-2">CodeCraft</h2>
        <p className="text-xl mb-8 text-slate-800 font-semibold">Sistema de Gestión de Inventario</p>
        
        <LoginForm />
      </div>

       {/* Footer "Created By Codecraft" */}
      <div className="fixed bottom-4 text-slate-800 text-sm z-20">
        <p>Creado por Codecraft</p>
      </div>
    </div>
  );
};

export default LoginPage;