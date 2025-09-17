from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from inventory.models import Role, User, Product, Transaction


class Command(BaseCommand):
    help = 'Crear datos de prueba para la API'

    def handle(self, *args, **options):
        self.stdout.write('Creando datos de prueba...')
        
        # Crear roles
        admin_role, _ = Role.objects.get_or_create(
            name='administrador',
            defaults={
                'description': 'Administrador del sistema con todos los permisos'
            }
        )
        
        user_role, _ = Role.objects.get_or_create(
            name='usuario',
            defaults={
                'description': 'Usuario estándar del sistema'
            }
        )
        
        # Crear usuarios
        admin_user, created = User.objects.get_or_create(
            email='admin@codecraft.com',
            defaults={
                'first_name': 'Admin',
                'last_name': 'Sistema',
                'phone': '+57 300 123 4567',
                'address': 'Calle Principal #123, Medellín',
                'role': admin_role,
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(f'Usuario admin creado: admin@codecraft.com / admin123')
        
        regular_user, created = User.objects.get_or_create(
            email='usuario@codecraft.com',
            defaults={
                'first_name': 'Juan',
                'last_name': 'Pérez',
                'phone': '+57 300 987 6543',
                'address': 'Carrera 45 #67-89, Medellín',
                'role': user_role
            }
        )
        if created:
            regular_user.set_password('usuario123')
            regular_user.save()
            self.stdout.write(f'Usuario regular creado: usuario@codecraft.com / usuario123')
        
        # Crear productos de prueba
        productos_data = [
            {
                'name': 'Camisa Casual Hombre',
                'type': 'camisas',
                'quantity': 25,
                'description': 'Camisa casual de algodón para hombre, perfecta para uso diario',
                'size': 'M',
                'reference': 'CAM001M',
                'price': Decimal('45000.00')
            },
            {
                'name': 'Camisa Casual Hombre',
                'type': 'camisas',
                'quantity': 20,
                'description': 'Camisa casual de algodón para hombre, perfecta para uso diario',
                'size': 'L',
                'reference': 'CAM001L',
                'price': Decimal('45000.00')
            },
            {
                'name': 'Jean Clásico Mujer',
                'type': 'pantalones',
                'quantity': 15,
                'description': 'Jean clásico de mezclilla para mujer, corte skinny',
                'size': 'M',
                'reference': 'JEA002M',
                'price': Decimal('85000.00')
            },
            {
                'name': 'Vestido Elegante',
                'type': 'vestidos',
                'quantity': 8,
                'description': 'Vestido elegante para ocasiones especiales',
                'size': 'S',
                'reference': 'VES003S',
                'price': Decimal('120000.00')
            },
            {
                'name': 'Zapatos Deportivos',
                'type': 'zapatos',
                'quantity': 12,
                'description': 'Zapatos deportivos cómodos para actividad física',
                'size': 'L',
                'reference': 'ZAP004L',
                'price': Decimal('180000.00')
            },
            {
                'name': 'Collar Fashion',
                'type': 'accesorios',
                'quantity': 30,
                'description': 'Collar fashion para complementar cualquier outfit',
                'size': 'UNICA',
                'reference': 'COL005U',
                'price': Decimal('25000.00')
            },
            {
                'name': 'Camiseta Deportiva',
                'type': 'deportiva',
                'quantity': 5,  # Stock bajo para testing
                'description': 'Camiseta deportiva transpirable para entrenamiento',
                'size': 'M',
                'reference': 'DEP006M',
                'price': Decimal('35000.00')
            },
            {
                'name': 'Chaqueta Invierno',
                'type': 'abrigos',
                'quantity': 18,
                'description': 'Chaqueta cálida para temporada de invierno',
                'size': 'XL',
                'reference': 'CHQ007XL',
                'price': Decimal('250000.00')
            }
        ]
        
        productos_creados = []
        for producto_data in productos_data:
            producto, created = Product.objects.get_or_create(
                reference=producto_data['reference'],
                defaults=producto_data
            )
            if created:
                productos_creados.append(producto)
                self.stdout.write(f'Producto creado: {producto.name} - {producto.reference}')
        
        # Crear transacciones de prueba
        if productos_creados:
            fechas_base = [
                timezone.now() - timedelta(days=15),
                timezone.now() - timedelta(days=10),
                timezone.now() - timedelta(days=8),
                timezone.now() - timedelta(days=5),
                timezone.now() - timedelta(days=3),
                timezone.now() - timedelta(days=1),
            ]
            
            transacciones_data = [
                # Entradas de stock
                {
                    'user': admin_user,
                    'product': productos_creados[0],  # Camisa M
                    'type': 'entrada',
                    'supplier': 'Proveedor Textil ABC',
                    'quantity': 50,
                    'price': Decimal('30000.00'),  # Precio de compra
                    'date': fechas_base[0]
                },
                {
                    'user': admin_user,
                    'product': productos_creados[2],  # Jean M
                    'type': 'entrada',
                    'supplier': 'Distribuidora Denim SA',
                    'quantity': 30,
                    'price': Decimal('55000.00'),
                    'date': fechas_base[1]
                },
                {
                    'user': admin_user,
                    'product': productos_creados[4],  # Zapatos deportivos
                    'type': 'entrada',
                    'supplier': 'Importadora Sport',
                    'quantity': 25,
                    'price': Decimal('120000.00'),
                    'date': fechas_base[2]
                },
                
                # Salidas de stock (ventas)
                {
                    'user': regular_user,
                    'product': productos_creados[0],  # Camisa M
                    'type': 'salida',
                    'supplier': '',  # Venta no lleva proveedor
                    'quantity': 3,
                    'price': Decimal('45000.00'),  # Precio de venta
                    'date': fechas_base[3]
                },
                {
                    'user': regular_user,
                    'product': productos_creados[2],  # Jean M
                    'type': 'salida',
                    'supplier': '',
                    'quantity': 2,
                    'price': Decimal('85000.00'),
                    'date': fechas_base[4]
                },
                {
                    'user': admin_user,
                    'product': productos_creados[3],  # Vestido S
                    'type': 'salida',
                    'supplier': '',
                    'quantity': 1,
                    'price': Decimal('120000.00'),
                    'date': fechas_base[5]
                },
                {
                    'user': regular_user,
                    'product': productos_creados[5],  # Collar
                    'type': 'salida',
                    'supplier': '',
                    'quantity': 5,
                    'price': Decimal('25000.00'),
                    'date': fechas_base[5]
                }
            ]
            
            for trans_data in transacciones_data:
                # Calcular stock antes de la transacción para evitar errores
                producto = trans_data['product']
                if trans_data['type'] == 'salida' and producto.quantity < trans_data['quantity']:
                    # Ajustar cantidad para que no exceda el stock
                    trans_data['quantity'] = min(trans_data['quantity'], producto.quantity)
                
                if trans_data['quantity'] > 0:  # Solo crear si la cantidad es válida
                    transaccion = Transaction.objects.create(**trans_data)
                    self.stdout.write(
                        f'Transacción creada: {transaccion.type} - {transaccion.product.name} - '
                        f'{transaccion.quantity} unidades'
                    )
        
        self.stdout.write(
            self.style.SUCCESS(
                '\n¡Datos de prueba creados exitosamente!\n\n'
                'Usuarios creados:\n'
                '- Admin: admin@codecraft.com / admin123\n'
                '- Usuario: usuario@codecraft.com / usuario123\n\n'
                'Puedes acceder a:\n'
                '- Swagger UI: http://127.0.0.1:8000/api/docs/\n'
                '- Admin panel: http://127.0.0.1:8000/admin/\n'
                '- API endpoints: http://127.0.0.1:8000/api/\n'
            )
        )