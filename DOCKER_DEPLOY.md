# 🐳 Docker Deployment Guide - CodeCraft

Production-ready Docker deployment guide for the CodeCraft inventory management system.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [Network Access](#network-access)
6. [Production Deployment](#production-deployment)
7. [Maintenance](#maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Docker Engine** v20.10+ or **Docker Desktop** v4.0+
- **Docker Compose** v2.0+ (included in Docker Desktop)

### Verify Installation

```bash
docker --version              # Should be 20.10+
docker-compose --version      # Should be v2.0+
```

### System Requirements

- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: 5GB free space
- **Ports**: 80, 8000, 3306 must be available

---

## Architecture

### Container Stack

```
┌─────────────────────────────────────┐
│         Client / Browser             │
└───────────────┬─────────────────────┘
                │ HTTP :80
                ↓
┌─────────────────────────────────────┐
│    frontend (Nginx + React SPA)     │
│    - Static assets serving          │
│    - Reverse proxy to backend       │
└───────────────┬─────────────────────┘
                │ Internal network
                ↓
┌─────────────────────────────────────┐
│    backend (Django REST API)        │
│    - JWT authentication             │
│    - Business logic                 │
└───────────────┬─────────────────────┘
                │ MySQL protocol
                ↓
┌─────────────────────────────────────┐
│    db (MySQL 8.0)                   │
│    - Persistent storage             │
│    - Volume: db_data                │
└─────────────────────────────────────┘
```

### Services

| Service    | Technology              | Port | Volume         | Description          |
|------------|-------------------------|------|----------------|----------------------|
| `frontend` | Nginx 1.25 + React 19   | 80   | -              | Web server + SPA     |
| `backend`  | Python 3.11 + Django 5.1| 8000 | static_volume  | REST API             |
| `db`       | MySQL 8.0               | 3306 | db_data        | Database (persistent)|

### Network

- **Bridge network**: `codecraft-network`
- **Internal communication**: Services communicate by service name
- **External access**: Frontend port 80 exposed by default

---

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd CodeCraft
```

### 2. Environment Configuration

Ensure `.env` file exists in root directory:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

# Database Settings
DB_NAME=codecraft_db
DB_USER=codecraft
DB_PASSWORD=SecurePassword123!
DB_HOST=db
DB_PORT=3306
DB_ROOT_PASSWORD=RootPassword123!

# Security
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 3. Build and Run

```bash
# Build all images
docker-compose build

# Start services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Verify Deployment

```bash
# Check container status
docker-compose ps

# Expected output:
# NAME                 STATUS
# codecraft_backend    Up (healthy)
# codecraft_db         Up (healthy)
# codecraft_frontend   Up
```

### 5. Access Application

| Service        | URL                              | Credentials                        |
|----------------|----------------------------------|------------------------------------|
| Frontend       | http://localhost                 | -                                  |
| Backend API    | http://localhost:8000            | -                                  |
| API Docs       | http://localhost:8000/api/docs/  | -                                  |
| Django Admin   | http://localhost:8000/admin/     | admin@codecraft.com / admin123     |

---

## Configuration

### Environment Variables

Key variables in `.env`:

| Variable                 | Description                      | Example                          |
|--------------------------|----------------------------------|----------------------------------|
| `SECRET_KEY`             | Django secret key                | `django-insecure-...`            |
| `DEBUG`                  | Debug mode (False in production) | `True` / `False`                 |
| `ALLOWED_HOSTS`          | Allowed hostnames                | `localhost,example.com`          |
| `DB_NAME`                | Database name                    | `codecraft_db`                   |
| `DB_USER`                | Database user                    | `codecraft`                      |
| `DB_PASSWORD`            | Database password                | `SecurePass123!`                 |
| `DB_HOST`                | Database host                    | `db` (Docker) / `localhost` (local) |
| `CORS_ALLOWED_ORIGINS`   | CORS whitelist                   | `http://localhost:3000`          |

### Database Migrations

Migrations run automatically on container start. To manually manage:

```bash
# Create new migrations
docker exec codecraft_backend python manage.py makemigrations

# Apply migrations
docker exec codecraft_backend python manage.py migrate

# View migration status
docker exec codecraft_backend python manage.py showmigrations
```

### Static Files

Static files are collected automatically on container start:

```bash
# Manually collect static files
docker exec codecraft_backend python manage.py collectstatic --no-input
```

---

## Network Access

### Localhost Only (Default)

Default configuration allows access only from `localhost`:

```
http://localhost
```

### Local Area Network (LAN)

To allow access from other devices on your network:

**1. Get your local IP address:**

```bash
# Windows
ipconfig | findstr IPv4

# Linux/Mac
ifconfig | grep "inet "
```

Example output: `192.168.0.4`

**2. Update `.env` file:**

```env
ALLOWED_HOSTS=127.0.0.1,localhost,192.168.0.4
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://192.168.0.4
```

**3. Restart backend:**

```bash
docker-compose restart backend
```

**4. Access from any device on your network:**

```
http://192.168.0.4
```

### Firewall Configuration (Windows)

If unable to access from LAN, allow port 80:

```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Docker CodeCraft" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
```

---

## Production Deployment

### Pre-Production Checklist

- [ ] Change `DEBUG=False` in `.env`
- [ ] Set strong `SECRET_KEY`
- [ ] Use strong database passwords
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CORS for production domains
- [ ] Remove port 3306 exposure from `docker-compose.yml`
- [ ] Set up automated backups
- [ ] Configure logging and monitoring

### Cloud Deployment Options

#### Option 1: AWS (EC2 + RDS)

```bash
# 1. Launch EC2 instance (Ubuntu 22.04)
# 2. Install Docker and Docker Compose
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo usermod -aG docker $USER

# 3. Clone repository
git clone <repo-url>
cd CodeCraft

# 4. Configure production .env
nano .env

# 5. Deploy
docker-compose up -d

# 6. Configure security groups (ports 80, 443)
# 7. Set up Application Load Balancer with SSL
```

#### Option 2: DigitalOcean (Droplet)

```bash
# 1. Create Docker Droplet
# 2. SSH to droplet
ssh root@your-droplet-ip

# 3. Clone and configure
git clone <repo-url>
cd CodeCraft
nano .env

# 4. Deploy
docker-compose up -d

# 5. Configure firewall
ufw allow 80
ufw allow 443
ufw enable
```

#### Option 3: Railway

1. Connect GitHub repository
2. Railway auto-detects `docker-compose.yml`
3. Configure environment variables in Railway dashboard
4. Deploy automatically on git push

### SSL/HTTPS Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already configured by certbot)
sudo certbot renew --dry-run
```

---

## Maintenance

### Daily Operations

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose stop

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Code Updates

**Backend changes:**
```bash
docker-compose build backend
docker-compose up -d backend
```

**Frontend changes:**
```bash
docker-compose build frontend
docker-compose up -d frontend
```

**Database model changes:**
```bash
docker exec codecraft_backend python manage.py makemigrations
docker exec codecraft_backend python manage.py migrate
```

### Database Backup

```bash
# Create backup
docker exec codecraft_db mysqldump -u codecraft -p codecraft_db > backup_$(date +%Y%m%d).sql

# Restore backup
docker exec -i codecraft_db mysql -u codecraft -p codecraft_db < backup_20250103.sql
```

### Monitoring

```bash
# Resource usage
docker stats

# Service health
docker-compose ps

# Application logs
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 frontend
```

### Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes (⚠️ CAUTION: removes database data)
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

---

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

**Common causes:**
- Port already in use
- Insufficient memory
- Database not ready
- Configuration errors in `.env`

### Port Already in Use

**Identify process:**
```bash
# Windows
netstat -ano | findstr :80

# Linux/Mac
lsof -i :80
```

**Solution 1:** Stop conflicting process

**Solution 2:** Change port in `docker-compose.yml`:
```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Access via http://localhost:8080
```

### Database Connection Failed

**Check database health:**
```bash
docker-compose ps

# Should show "healthy" for db service
```

**Restart database:**
```bash
docker-compose restart db
sleep 10
docker-compose restart backend
```

### Frontend Not Loading

**Check Nginx logs:**
```bash
docker-compose logs frontend
```

**Rebuild frontend:**
```bash
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

**Clear browser cache:** `Ctrl + Shift + R`

### Backend API Errors

**Check backend logs:**
```bash
docker-compose logs backend --tail=50
```

**Common issues:**
- CORS errors: Check `CORS_ALLOWED_ORIGINS` in `.env`
- Database errors: Check database connection
- Migration errors: Run `python manage.py migrate`

### Out of Memory

**Increase Docker memory allocation:**
- Docker Desktop → Settings → Resources → Memory
- Allocate at least 4GB (8GB recommended)

### Line Ending Issues (Windows)

If `docker-entrypoint.sh` fails:

```bash
# Convert to Unix line endings
dos2unix backend/docker-entrypoint.sh

# Rebuild backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

---

## Additional Resources

### Docker Commands Reference

```bash
# Build
docker-compose build [service]          # Build specific service
docker-compose build --no-cache         # Build without cache

# Start/Stop
docker-compose up -d                    # Start all services
docker-compose down                     # Stop and remove containers
docker-compose down -v                  # Stop and remove volumes
docker-compose restart [service]        # Restart service

# Logs
docker-compose logs [service]           # View logs
docker-compose logs -f [service]        # Follow logs
docker-compose logs --tail=50 [service] # Last 50 lines

# Execute commands
docker exec codecraft_backend <command> # Run command in backend
docker exec -it codecraft_backend bash  # Interactive shell

# Status
docker-compose ps                       # Service status
docker stats                            # Resource usage
```

### Service Access

```bash
# Backend shell
docker exec -it codecraft_backend bash

# Django shell
docker exec -it codecraft_backend python manage.py shell

# MySQL client
docker exec -it codecraft_db mysql -u codecraft -p

# Frontend shell (Nginx)
docker exec -it codecraft_frontend sh
```

### Documentation

- Docker: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Django: https://docs.djangoproject.com/
- React: https://react.dev/
- MySQL: https://dev.mysql.com/doc/

---

## Security Best Practices

### Production Security

1. **Never expose database port (3306) in production**
   ```yaml
   # Comment out in docker-compose.yml
   # ports:
   #   - "3306:3306"
   ```

2. **Use strong credentials**
   - Generate secure `SECRET_KEY`: `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`
   - Use complex database passwords
   - Change default admin credentials

3. **Disable debug mode**
   ```env
   DEBUG=False
   ```

4. **Configure ALLOWED_HOSTS**
   ```env
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   ```

5. **Use HTTPS in production**
   - Configure SSL certificates
   - Redirect HTTP to HTTPS
   - Set `SECURE_SSL_REDIRECT=True`

6. **Implement rate limiting**
   - Use Django REST Framework throttling
   - Configure Nginx rate limiting

7. **Regular updates**
   - Keep Docker images updated
   - Update Python/Node packages
   - Apply security patches

---

## Quick Reference

### First Time Setup

```bash
git clone <repo-url>
cd CodeCraft
docker-compose build
docker-compose up -d
```

### Daily Development

```bash
# Start
docker-compose up -d

# Code changes in backend
docker-compose build backend && docker-compose up -d backend

# Code changes in frontend
docker-compose build frontend && docker-compose up -d frontend

# Stop
docker-compose stop
```

### Access Points

- **Application**: http://localhost
- **API Docs**: http://localhost:8000/api/docs/
- **Admin**: http://localhost:8000/admin/

### Default Credentials

- **Email**: admin@codecraft.com
- **Password**: admin123

---

**Need help with daily usage?** See `exposición/sprint 2/GUIA_RAPIDA_DOCKER.md`

**Need help updating code?** See `exposición/sprint 2/ACTUALIZACION_CODIGO_DOCKER.md`
