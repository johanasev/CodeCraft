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

echo "Creando datos iniciales..."
python manage.py shell << EOF
from inventory.models import User, Role, Product, Supplier, Transaction
import os
from decimal import Decimal
from datetime import datetime, timedelta

email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@codecraft.com')
password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin123')

# Crear roles
admin_role, _ = Role.objects.get_or_create(
    name='administrador',
    defaults={'description': 'Administrador del sistema'}
)

employee_role, _ = Role.objects.get_or_create(
    name='empleado',
    defaults={'description': 'Empleado del sistema'}
)

# Crear superusuario
if not User.objects.filter(email=email).exists():
    admin_user = User.objects.create_superuser(
        email=email,
        password=password,
        first_name='Admin',
        last_name='Sistema',
        role=admin_role
    )
    print(f"Superusuario {email} creado exitosamente!")
else:
    admin_user = User.objects.get(email=email)
    print(f"Superusuario {email} ya existe.")

# Crear usuario empleado
if not User.objects.filter(email='empleado@codecraft.com').exists():
    employee_user = User.objects.create_user(
        email='empleado@codecraft.com',
        password='empleado123',
        first_name='Juan',
        last_name='Pérez',
        role=employee_role
    )
    print("Usuario empleado creado exitosamente!")
else:
    employee_user = User.objects.get(email='empleado@codecraft.com')
    print("Usuario empleado ya existe.")

# Crear proveedores
suppliers_data = [
    {
        'name': 'Textiles Colombia',
        'type': 'Nacional',
        'contact': 'María González',
        'phone': '3001234567',
        'email': 'contacto@textilescolombia.com',
        'address': 'Cra 45 #30-22, Medellín, Colombia'
    },
    {
        'name': 'Fashion International',
        'type': 'Internacional',
        'contact': 'John Smith',
        'phone': '+1 555 789 0123',
        'email': 'info@fashionint.com',
        'address': '123 Fashion Ave, New York, USA'
    },
    {
        'name': 'Ropa Bogotá',
        'type': 'Nacional',
        'contact': 'Carlos Rodríguez',
        'phone': '3109876543',
        'email': 'ventas@ropabogota.co',
        'address': 'Av 19 #85-32, Bogotá, Colombia'
    }
]

for supplier_data in suppliers_data:
    supplier, created = Supplier.objects.get_or_create(
        email=supplier_data['email'],
        defaults=supplier_data
    )
    if created:
        print(f"Proveedor {supplier.name} creado exitosamente!")

# Crear productos
products_data = [
    {
        'name': 'Camiseta Básica',
        'type': 'camisas',
        'quantity': 150,
        'description': 'Camiseta básica de algodón 100%',
        'price': Decimal('25000.00'),
        'size': 'M',
        'color': 'Blanco',
        'reference': 'CAM-001'
    },
    {
        'name': 'Jeans Clásico',
        'type': 'pantalones',
        'quantity': 80,
        'description': 'Pantalón jeans clásico de mezclilla',
        'price': Decimal('85000.00'),
        'size': 'L',
        'color': 'Azul',
        'reference': 'PAN-002'
    },
    {
        'name': 'Vestido Floral',
        'type': 'vestidos',
        'quantity': 45,
        'description': 'Vestido floral para verano',
        'price': Decimal('120000.00'),
        'size': 'S',
        'color': 'Multicolor',
        'reference': 'VES-003'
    },
    {
        'name': 'Zapatos Deportivos',
        'type': 'zapatos',
        'quantity': 60,
        'description': 'Zapatos deportivos para running',
        'price': Decimal('180000.00'),
        'size': '42',
        'color': 'Negro',
        'reference': 'ZAP-004'
    }
]

for product_data in products_data:
    product, created = Product.objects.get_or_create(
        reference=product_data['reference'],
        defaults=product_data
    )
    if created:
        print(f"Producto {product.name} creado exitosamente!")

# Crear transacciones de muestra
products = Product.objects.all()
suppliers = Supplier.objects.all()

for i, product in enumerate(products):
    supplier = suppliers[i % len(suppliers)]

    # Transacción de entrada
    entry_transaction = Transaction.objects.create(
        product=product,
        type='entrada',
        quantity=50,
        supplier=supplier.name,
        price=product.price,
        user=admin_user,
        date=datetime.now() - timedelta(days=i+1)
    )

    # Transacción de salida
    exit_transaction = Transaction.objects.create(
        product=product,
        type='salida',
        quantity=20,
        supplier='',
        price=product.price,
        user=employee_user,
        date=datetime.now() - timedelta(hours=i*2)
    )

print("Datos iniciales creados exitosamente!")
EOF

echo "Iniciando servidor Django..."
# Usar Gunicorn en producción (DEBUG=False) o runserver en desarrollo (DEBUG=True)
if [ "$DEBUG" = "False" ] || [ "$DEBUG" = "false" ]; then
    echo "Modo producción detectado, usando Gunicorn..."
    exec gunicorn CodeCraft_backend.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 120 --access-logfile - --error-logfile -
else
    echo "Modo desarrollo detectado, usando runserver..."
    exec python manage.py runserver 0.0.0.0:8000
fi
