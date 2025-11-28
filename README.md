# CodeCraft - Sistema de Gestión de Inventario 📦

![CodeCraft Logo](https://img.shields.io/badge/CodeCraft-Sistema%20de%20Inventario-0ea5e9)
![Django](https://img.shields.io/badge/Django-4.2-092E20?logo=django)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)

Sistema completo de gestión de inventario desarrollado con Django REST Framework (backend) y React + Vite (frontend), containerizado con Docker para fácil despliegue.

Desarrollado para **Proyecto Integrador I** - Universidad de Antioquia

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#%EF%B8%8F-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación Rápida](#-instalación-rápida)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Despliegue en Producción](#-despliegue-en-producción)
- [Documentación](#-documentación)
- [Equipo](#-equipo)

---

## ✨ Características

### Gestión de Usuarios
- ✅ Autenticación JWT (JSON Web Tokens)
- ✅ Roles de usuario (Administrador/Usuario)
- ✅ Activación/desactivación de usuarios
- ✅ Gestión de perfiles con foto

### Gestión de Productos
- ✅ CRUD completo de productos
- ✅ Categorización por tipo (camisas, pantalones, vestidos, etc.)
- ✅ Control de stock mínimo con alertas
- ✅ Filtros avanzados (nombre, categoría, referencia, estado)
- ✅ Activación/desactivación de productos
- ✅ Indicadores visuales de stock bajo

### Gestión de Transacciones
- ✅ Registro de entradas y salidas de inventario
- ✅ Validación automática de stock disponible
- ✅ Historial completo de movimientos
- ✅ Gráficas y estadísticas interactivas
- ✅ Filtros por producto, usuario y referencia
- ✅ Asociación con proveedores

### Gestión de Proveedores
- ✅ CRUD de proveedores
- ✅ Clasificación por tipo
- ✅ Protección contra eliminación con transacciones activas
- ✅ Filtro por estado (activo/inactivo)
- ✅ Solo proveedores activos en transacciones

### Visualización y Reportes
- 📊 Dashboard con estadísticas en tiempo real
- 📈 Gráficas de inventario y transacciones (Recharts)
- 📉 Indicadores de stock bajo con alertas visuales
- 📋 Tablas responsivas con filtros dinámicos
- 🎨 Interfaz moderna con Tailwind CSS

---

## 🛠️ Tecnologías

### Backend
- **Django 4.2**: Framework web de Python
- **Django REST Framework**: API RESTful robusta
- **MySQL/PostgreSQL**: Base de datos relacional
- **JWT Authentication**: Autenticación segura con tokens
- **CORS Headers**: Control de acceso de origen cruzado
- **Python 3.10+**: Lenguaje de programación

### Frontend
- **React 18.2**: Biblioteca de UI moderna
- **Vite**: Build tool ultra-rápido
- **React Router**: Navegación SPA
- **Recharts**: Gráficas y visualizaciones interactivas
- **Tailwind CSS**: Framework de estilos utility-first
- **Axios**: Cliente HTTP para API
- **React Icons**: Iconografía

### DevOps
- **Docker**: Containerización de aplicaciones
- **Docker Compose**: Orquestación de servicios
- **Nginx**: Servidor web (producción)
- **MySQL**: Base de datos en contenedor

---

## 📦 Requisitos Previos

### Para Desarrollo Local
- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (>= 20.10)
- [Docker Compose](https://docs.docker.com/compose/) (>= 2.0)

### Para Despliegue en VPS
- Ubuntu Server (20.04 o superior)
- Docker y Docker Compose instalados
- Acceso root o sudo

---

## 🚀 Instalación Rápida

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/CodeCraft.git
cd CodeCraft
```

### 2. Configurar Variables de Entorno

El proyecto incluye un archivo `.env` preconfigurado. Para producción, crea uno nuevo:

```bash
cp .env .env.prod
```

Edita `.env.prod` con configuraciones seguras:

```env
# Database
DB_NAME=codecraft_db
DB_USER=codecraft
DB_PASSWORD=TU_PASSWORD_SEGURO_AQUI
DB_ROOT_PASSWORD=TU_ROOT_PASSWORD_SEGURO

# Django
SECRET_KEY=GENERA_UNA_CLAVE_SECRETA_LARGA_Y_ALEATORIA
DEBUG=False
ALLOWED_HOSTS=tu-dominio.com,tu-ip-vps

# Frontend
VITE_API_URL=http://tu-dominio.com:8000
```

### 3. Levantar los Servicios

#### Para Desarrollo:
```bash
docker-compose up -d
```

#### Para Producción:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### 4. Acceder a la Aplicación

- **Frontend**: http://localhost (producción) o http://localhost:5173 (desarrollo)
- **Backend API**: http://localhost:8000
- **Admin Django**: http://localhost:8000/admin

**Credenciales por defecto**:
- Email: admin@codecraft.com
- Password: admin123

**⚠️ IMPORTANTE**: Cambia estas credenciales inmediatamente en producción.

---

## 📁 Estructura del Proyecto

```
CodeCraft/
├── backend/                      # Django Backend
│   ├── CodeCraft_backend/        # Configuración del proyecto
│   │   ├── settings.py           # Configuración Django
│   │   ├── urls.py               # URLs principales
│   │   └── wsgi.py               # WSGI para producción
│   ├── inventory/                # App principal de inventario
│   │   ├── models.py             # Modelos de datos
│   │   ├── serializers.py        # Serializers DRF
│   │   ├── views.py              # Vistas y endpoints API
│   │   ├── urls.py               # Rutas de la API
│   │   └── migrations/           # Migraciones de BD
│   ├── Dockerfile                # Dockerfile del backend
│   ├── requirements.txt          # Dependencias Python
│   └── manage.py                 # CLI de Django
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── api/                  # Servicios de API
│   │   │   ├── inventoryService.js
│   │   │   └── authService.js
│   │   ├── app/
│   │   │   └── dashboard/        # Componentes de dashboard
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── UserDashboard.jsx
│   │   │       ├── ProductManagementView.jsx
│   │   │       ├── TransactionManagementView.jsx
│   │   │       ├── UserManagementView.jsx
│   │   │       ├── Suppliers.jsx
│   │   │       └── ...
│   │   ├── components/           # Componentes reutilizables
│   │   ├── context/              # Context API (AuthContext)
│   │   ├── App.jsx               # Componente raíz
│   │   └── main.jsx              # Punto de entrada
│   ├── Dockerfile                # Dockerfile del frontend
│   ├── package.json              # Dependencias Node
│   ├── vite.config.js            # Configuración Vite
│   └── tailwind.config.js        # Configuración Tailwind
├── docs/                         # Documentación
│   ├── DESPLIEGUE_VPS.md        # Guía de despliegue
│   ├── FAQ.md                    # Preguntas frecuentes
│   ├── GUIA_EXPOSICION.md       # Guía de exposición
│   └── GUIA_DEMOSTRACION.md     # Guía de demostración
├── docker-compose.yml            # Configuración desarrollo
├── docker-compose.prod.yml       # Configuración producción
├── .env                          # Variables de entorno
├── .gitignore                    # Archivos ignorados por Git
├── .dockerignore                 # Archivos ignorados por Docker
└── README.md                     # Este archivo
```

---

## 🔌 API Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login/` | Login y obtener tokens JWT |
| POST | `/api/auth/register/` | Registro de nuevo usuario |
| POST | `/api/auth/token/refresh/` | Refrescar access token |
| POST | `/api/auth/logout/` | Logout y invalidar tokens |

### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products/` | Listar todos los productos |
| POST | `/api/products/` | Crear nuevo producto |
| GET | `/api/products/{id}/` | Obtener producto específico |
| PUT | `/api/products/{id}/` | Actualizar producto |
| DELETE | `/api/products/{id}/` | Eliminar producto |
| POST | `/api/products/{id}/toggle_active/` | Activar/desactivar producto |

### Transacciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/transactions/` | Listar transacciones |
| POST | `/api/transactions/` | Crear nueva transacción |
| GET | `/api/transactions/{id}/` | Obtener transacción |
| DELETE | `/api/transactions/{id}/` | Eliminar transacción |

### Proveedores
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/suppliers/` | Listar proveedores |
| POST | `/api/suppliers/` | Crear proveedor |
| GET | `/api/suppliers/{id}/` | Obtener proveedor |
| PUT | `/api/suppliers/{id}/` | Actualizar proveedor |
| DELETE | `/api/suppliers/{id}/` | Eliminar proveedor |
| POST | `/api/suppliers/{id}/toggle_active/` | Activar/desactivar |

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users/` | Listar usuarios (admin) |
| POST | `/api/users/` | Crear usuario (admin) |
| GET | `/api/users/{id}/` | Obtener usuario |
| PUT | `/api/users/{id}/` | Actualizar usuario |
| DELETE | `/api/users/{id}/` | Eliminar usuario |
| POST | `/api/users/{id}/toggle_active/` | Activar/desactivar |

---

## 🌐 Despliegue en Producción

### VPS con Ubuntu y Docker

Ver la guía completa en [docs/DESPLIEGUE_VPS.md](./docs/DESPLIEGUE_VPS.md)

#### Pasos Rápidos:

1. **Conectar al VPS**
```bash
ssh root@tu-ip-vps
```

2. **Clonar el proyecto**
```bash
git clone https://github.com/tu-usuario/CodeCraft.git
cd CodeCraft
```

3. **Configurar entorno**
```bash
cp .env .env.prod
nano .env.prod  # Editar con configuraciones de producción
```

4. **Desplegar**
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

5. **Verificar**
```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 💻 Comandos Útiles

### Ver logs en tiempo real
```bash
docker-compose logs -f                    # Todos los servicios
docker-compose logs -f backend            # Solo backend
docker-compose logs -f frontend           # Solo frontend
```

### Ejecutar migraciones
```bash
docker-compose exec backend python manage.py migrate
```

### Crear superusuario
```bash
docker-compose exec backend python manage.py createsuperuser
```

### Acceder al shell de Django
```bash
docker-compose exec backend python manage.py shell
```

### Acceder a MySQL
```bash
docker-compose exec db mysql -u codecraft -p codecraft_db
```

### Detener servicios
```bash
docker-compose down                       # Detener
docker-compose down -v                    # Detener y eliminar volúmenes
```

### Reconstruir servicios
```bash
docker-compose up -d --build
```

---

## 📚 Documentación

- **[Guía de Despliegue en VPS](./docs/DESPLIEGUE_VPS.md)**: Instrucciones detalladas para desplegar en producción
- **[Guía de Exposición](./docs/GUIA_EXPOSICION.md)**: Material para presentación del proyecto
- **[Preguntas Frecuentes](./docs/FAQ.md)**: Solución a problemas comunes
- **[Guía de Demostración](./docs/GUIA_DEMOSTRACION.md)**: Script para demostración funcional

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 👥 Equipo

**CodeCraft Team** - Universidad de Antioquia
- **Johana Sevillano** - Desarrollo Frontend
- **Juan Cardona** - Desarrollo Backend

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos para el curso de Proyecto Integrador I.

---

## 🆘 Soporte

Si encuentras problemas o tienes preguntas:

1. Consulta la [documentación](./docs/)
2. Revisa las [FAQ](./docs/FAQ.md)
3. Contacta al equipo de desarrollo

---

**Desarrollado con ❤️ por el equipo CodeCraft**

*Universidad de Antioquia - 2024*
