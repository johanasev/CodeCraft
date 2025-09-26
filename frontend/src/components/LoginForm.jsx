import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// --- Corrección de error: Se reemplazan los íconos de 'react-icons' por SVGs en línea ---
// Esto elimina la necesidad de una librería externa y soluciona el error de compilación.

// Componente para el ícono de usuario
const UserIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={className} viewBox="0 0 16 16">
        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
    </svg>
);

// Componente para el ícono de candado
const LockIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={className} viewBox="0 0 16 16">
        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
    </svg>
);
// --- Fin de la corrección ---

const LoginForm = () => {
  // --- Lógica agregada ---
  // Estados para manejar los inputs y los errores
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook para redirigir al usuario

  // Función que se ejecuta al enviar el formulario
  const handleLogin = (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // Limpiar errores previos
    setError('');

    // Validación de credenciales
    if (email === 'admin@codercraft.com' && password === 'admin') {
      // Si es admin, redirige a la ruta de admin
      console.log('Acceso como administrador');
      navigate('/AdminDashboard');
      
    } else if (email === 'user@codercraft.com' && password === 'user') {
      // Si es usuario, redirige a la ruta de usuario
      console.log('Acceso como usuario');
      navigate('/UserDashboard');
    } else {
      // Si las credenciales son incorrectas, muestra un error
      setError('Correo electrónico o contraseña incorrectos.');
    }
  };
  // --- Fin de la lógica agregada ---

  return (
    // Tu JSX original se mantiene intacto
    <div className="bg-white p-8 rounded-md shadow-lg max-w-sm w-full mx-auto backdrop-blur-sm">
      {/* Se agrega el manejador de envío al formulario */}
      <form onSubmit={handleLogin}>
        <div className="mb-4 relative">
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              className="bg-white border border-gray-300 rounded-lg w-full py-2 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingrese correo"
              // Se conecta el input con el estado 'email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
              {/* Se utiliza el componente SVG en línea */}
              <UserIcon className="text-gray-400" />
            </div>
          </div>
        </div>
        <div className="mb-6 relative">
          <label htmlFor="password" className="sr-only">
            Contraseña
          </label>
          <div className="relative">
            <input
              type="password"
              id="password"
              className="bg-white border border-gray-300 rounded-lg w-full py-2 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingrese contraseña"
              // Se conecta el input con el estado 'password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
              {/* Se utiliza el componente SVG en línea */}
              <LockIcon className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Muestra el mensaje de error si existe */}
        {error && (
          <p className="text-red-500 text-center text-sm mb-4">{error}</p>
        )}

        <div className="flex flex-col items-center justify-between">
          <button
            type="submit" // Se especifica el tipo de botón para que active el onSubmit del form
            className="bg-codecraftBlue hover:bg-sky-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mb-4"
          >
            Iniciar Sesión
          </button>
          <Link to="/" className="inline-block align-baseline font-bold text-sm text-codecraftBlue hover:text-sky-500">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;

