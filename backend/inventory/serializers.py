from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import Role, User, Product, Transaction


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """JWT personalizado que incluye información del usuario"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Agregar claims personalizados al token
        token['user_id'] = user.id
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['role'] = user.role.name
        token['is_staff'] = user.is_staff
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Agregar información extra del usuario a la respuesta
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role_name': self.user.role.name,
            'is_staff': self.user.is_staff,
        }
        
        return data


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'first_name', 'last_name', 
                 'phone', 'address', 'role']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'address', 
                 'role', 'role_name', 'registration_date', 'last_access_date', 'is_active']
        read_only_fields = ['registration_date', 'last_access_date']


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Credenciales inválidas')
            if not user.is_active:
                raise serializers.ValidationError('Usuario inactivo')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Email y contraseña requeridos')


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'type', 'quantity', 'description', 'size', 
                 'reference', 'price']

    def validate_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("La cantidad no puede ser negativa")
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a 0")
        return value


class TransactionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_reference = serializers.CharField(source='product.reference', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'user_name', 'user_email', 'product', 'product_name', 
                 'product_reference', 'date', 'type', 'supplier', 'quantity', 'price']
        read_only_fields = ['date', 'user_name', 'user_email', 'product_name', 'product_reference']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0")
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a 0")
        return value

    def validate(self, attrs):
        if attrs.get('type') == 'salida':
            product = attrs.get('product')
            quantity = attrs.get('quantity')
            if product and product.quantity < quantity:
                raise serializers.ValidationError(
                    f"Stock insuficiente. Stock actual: {product.quantity}"
                )
        return attrs


class ProductStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas de productos"""
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    total_entries = serializers.IntegerField()
    total_exits = serializers.IntegerField()
    current_stock = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)


class TransactionStatsSerializer(serializers.Serializer):
    """Serializer para datos de gráficas temporales"""
    date = serializers.DateField()
    entries = serializers.IntegerField()
    exits = serializers.IntegerField()
    stock_level = serializers.IntegerField()