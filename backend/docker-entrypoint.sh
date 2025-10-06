#!/bin/bash

echo "Esperando a que la base de datos esté lista..."
while ! nc -z db 3306; do
  sleep 1
done
echo "Base de datos lista!"

echo "Aplicando migraciones..."
python manage.py makemigrations
python manage.py migrate

echo "Recolectando archivos estáticos..."
python manage.py collectstatic --noinput

echo "Creando superusuario si no existe..."
python manage.py shell << EOF
from inventory.models import User, Role
import os

email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@codecraft.com')
password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin123')

if not User.objects.filter(email=email).exists():
    admin_role, _ = Role.objects.get_or_create(
        name='administrador',
        defaults={'description': 'Administrador del sistema'}
    )
    User.objects.create_superuser(
        email=email,
        password=password,
        first_name='Admin',
        last_name='Sistema'
    )
    print(f"Superusuario {email} creado exitosamente!")
else:
    print(f"Superusuario {email} ya existe.")
EOF

echo "Iniciando servidor Django..."
python manage.py runserver 0.0.0.0:8000
