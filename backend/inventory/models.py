from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone

class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'roles'
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        
        # Si no se proporciona un rol, usar 'usuario' por defecto
        if 'role' not in extra_fields:
            user_role, created = Role.objects.get_or_create(
                name='usuario',
                defaults={'description': 'Usuario estándar del sistema'}
            )
            extra_fields['role'] = user_role
        
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        # Asegurar que existe el rol de administrador
        admin_role, created = Role.objects.get_or_create(
            name='administrador',
            defaults={'description': 'Administrador del sistema con todos los permisos'}
        )
        
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields['role'] = admin_role
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    # Eliminar el campo username ya que usaremos email
    username = None
    
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, verbose_name='Teléfono')
    address = models.TextField(blank=True, verbose_name='Dirección')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='users')
    registration_date = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de registro')
    last_access_date = models.DateTimeField(auto_now=True, verbose_name='Último acceso')
    is_active = models.BooleanField(default=True)
    
    # Especificar que usaremos email como campo de autenticación
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    # Usar nuestro CustomUserManager
    objects = CustomUserManager()
    
    def __str__(self):
        return self.email
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('camisas', 'Camisas'),
        ('pantalones', 'Pantalones'),
        ('vestidos', 'Vestidos'),
        ('zapatos', 'Zapatos'),
        ('accesorios', 'Accesorios'),
        ('ropa_interior', 'Ropa Interior'),
        ('deportiva', 'Ropa Deportiva'),
        ('abrigos', 'Abrigos y Chaquetas'),
    ]
    
    SIZE_CHOICES = [
        ('XS', 'Extra Pequeño'),
        ('S', 'Pequeño'),
        ('M', 'Mediano'),
        ('L', 'Grande'),
        ('XL', 'Extra Grande'),
        ('XXL', 'Doble Extra Grande'),
        ('UNICA', 'Talla Única'),
    ]
    
    name = models.CharField(max_length=150, verbose_name='Nombre')
    type = models.CharField(max_length=50, choices=CATEGORY_CHOICES, verbose_name='Tipo/Categoría')
    quantity = models.IntegerField(default=0, verbose_name='Cantidad')
    description = models.TextField(verbose_name='Descripción')
    size = models.CharField(max_length=10, choices=SIZE_CHOICES, verbose_name='Talla')
    reference = models.CharField(max_length=50, unique=True, verbose_name='Referencia')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Precio')
    
    def __str__(self):
        return f"{self.name} - {self.size}"
    
    class Meta:
        db_table = 'products'
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['name']

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='transactions')
    date = models.DateTimeField(auto_now_add=True, verbose_name='Fecha')
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPES, verbose_name='Tipo')
    supplier = models.CharField(max_length=150, blank=True, verbose_name='Proveedor')
    quantity = models.IntegerField(verbose_name='Cantidad')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Precio unitario')
    
    def __str__(self):
        return f"{self.type} - {self.product.name} - {self.quantity}"
    
    def save(self, *args, **kwargs):
        # Actualizar el stock del producto según el tipo de transacción
        if not self.pk:  # Solo en nuevas transacciones
            if self.type == 'entrada':
                self.product.quantity += self.quantity
            elif self.type == 'salida':
                if self.product.quantity >= self.quantity:
                    self.product.quantity -= self.quantity
                else:
                    raise ValueError(f"Stock insuficiente. Stock actual: {self.product.quantity}")
            
            self.product.save()
        
        super().save(*args, **kwargs)
    
    class Meta:
        db_table = 'transactions'
        verbose_name = 'Transacción'
        verbose_name_plural = 'Transacciones'
        ordering = ['-date']