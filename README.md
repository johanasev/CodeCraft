# CodeCraft: Entorno de Desarrollo Full-Stack 🚀

Este es el repositorio del proyecto **CodeCraft**, una aplicación web full-stack diseñada para **Poryecto Integrador I**.

---

## 🛠 Tecnologías Utilizadas

- **Frontend**: React (creado con Vite)  
- **Estilos**: TailwindCSS  
- **Backend**: Django (exponiendo una API REST)  
- **Framework de API**: Django REST Framework  
- **Base de datos**: MySQL  
- **Contenerización**: Docker  

---

## 📋 Requisitos Previos

Antes de clonar el repositorio, asegúrate de tener instalados los siguientes programas en tu sistema:

- [Git](https://git-scm.com/)  
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)  
- [Python 3.10+](https://www.python.org/downloads/)  
- [Node.js y npm](https://nodejs.org/en/)

---
<details>
  <summary><h2>⚙️ Configuración del Entorno de Desarrollo</h2></summary>

  <details>
    <summary>1. Clonar el Repositorio</summary>
  
  ```bash
  git clone https://github.com/tu-usuario/CodeCraft.git
  cd CodeCraft
  ```
  </details>

  <details>
    <summary>2. Configuración del Backend (Django)</summary>

  - Navega a la carpeta del backend.
  
  ```Bash
  cd backend
  ```
  - Crea y activa un entorno virtual de Python.

  ```Bash
  python -m venv venv
  # En Windows: venv\Scripts\activate
  # En macOS/Linux: source venv/bin/activate
  
  ```
  - Instala las dependencias de Django y Django REST Framework.

  ```Bash
  pip install Django djangorestframework mysqlclient
  ```
  - Crea el proyecto de Django (si no existe).
  
  ```Bash
  django-admin startproject CodeCraft_backend .
  ```
  </details>

<details>
<summary>3. Configuración del Frontend (React & TailwindCSS)</summary>

- Navega a la carpeta del frontend.

```Bash
cd ../frontend
```
- Instala las dependencias de Node.js.

```Bash
npm install
```
- Instala y configura TailwindCSS.

```Bash
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```
- Asegúrate de que el archivo src/index.css contenga las directivas de Tailwind.

```CSS

@tailwind base;
@tailwind components;
@tailwind utilities;
/* Resto de estilos base de Vite... */
```
</details>

<details>
<summary>4. Configuración de la Base de Datos (Docker)</summary>

- Asegúrate de que Docker Desktop se esté ejecutando en tu sistema.
- Navega a la raíz del proyecto (CodeCraft).
- Inicia el contenedor de MySQL.

```Bash
docker-compose up -d
```
</details>

</details>

---

<details>
<summary><h2> 💻 Cómo Iniciar la Aplicación</h2></summary>

Para ejecutar la aplicación completa, necesitarás tres terminales separadas.

1. Terminal 1 (Base de Datos)

- En la raíz del proyecto: ```docker-compose up -d```
- Verifica que el contenedor esté corriendo: ```docker ps```

2. Terminal 2 (Backend)

- En la carpeta backend:

```Bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```
3. Terminal 3 (Frontend)

- En la carpeta frontend: ```npm run dev```

</details>

---

<details>
<summary><h3>🤝 Team</h3></summary>

> - *Johana Sevillano* 
> - *Juan Cardona*
</details>
