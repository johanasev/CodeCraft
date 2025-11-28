from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Role, User, Product, Transaction, Supplier
from .serializers import (
    RoleSerializer, UserSerializer, UserRegistrationSerializer, LoginSerializer,
    ProductSerializer, TransactionSerializer, ProductStatsSerializer, TransactionStatsSerializer,
    CustomTokenObtainPairSerializer, SupplierSerializer
)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """Endpoint para login de usuarios"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        # Actualizar último acceso
        user.last_access_date = timezone.now()
        user.save()
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """Endpoint para registro de usuarios"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def logout_view(request):
    """Endpoint para logout de usuarios"""
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Logout exitoso'})
    except:
        return Response({'error': 'Error al cerrar sesión'}, status=status.HTTP_400_BAD_REQUEST)


class RoleViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de roles"""
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        # Solo administradores pueden crear/editar/eliminar roles
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated]
            # Aquí puedes añadir lógica adicional para verificar si es admin
        return super().get_permissions()


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de usuarios"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Los usuarios solo pueden ver su propio perfil, excepto administradores
        if self.request.user.role.name == 'administrador':
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    def destroy(self, request, *args, **kwargs):
        """Prevenir eliminación si hay transacciones relacionadas"""
        user = self.get_object()

        # Verificar si hay transacciones relacionadas
        has_transactions = Transaction.objects.filter(user=user).exists()

        if has_transactions:
            return Response({
                'error': 'No se puede eliminar este usuario porque tiene transacciones registradas.',
                'detail': 'Para mantener la integridad de los datos, considere inactivar el usuario en lugar de eliminarlo.',
                'can_deactivate': True,
                'user_id': user.id
            }, status=status.HTTP_400_BAD_REQUEST)

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Inactivar un usuario"""
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({
            'message': f'Usuario "{user.email}" inactivado exitosamente',
            'user': self.get_serializer(user).data
        })

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activar un usuario"""
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({
            'message': f'Usuario "{user.email}" activado exitosamente',
            'user': self.get_serializer(user).data
        })

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Obtener perfil del usuario actual"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        """Actualizar perfil del usuario actual"""
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de productos"""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        """Prevenir eliminación si hay transacciones relacionadas"""
        product = self.get_object()

        # Verificar si hay transacciones relacionadas
        has_transactions = Transaction.objects.filter(product=product).exists()

        if has_transactions:
            return Response({
                'error': 'No se puede eliminar este producto porque tiene transacciones registradas.',
                'detail': 'Para mantener la integridad de los datos, considere inactivar el producto en lugar de eliminarlo.',
                'can_deactivate': True,
                'product_id': product.id
            }, status=status.HTTP_400_BAD_REQUEST)

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Inactivar un producto"""
        product = self.get_object()
        product.is_active = False
        product.save()
        return Response({
            'message': f'Producto "{product.name}" inactivado exitosamente',
            'product': self.get_serializer(product).data
        })

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activar un producto"""
        product = self.get_object()
        product.is_active = True
        product.save()
        return Response({
            'message': f'Producto "{product.name}" activado exitosamente',
            'product': self.get_serializer(product).data
        })

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Obtener productos con stock bajo (usando minimum_stock)"""
        low_stock_products = Product.objects.filter(
            quantity__lte=F('minimum_stock'),
            is_active=True
        )
        serializer = self.get_serializer(low_stock_products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Obtener productos agrupados por categoría"""
        category = request.query_params.get('category', None)
        if category:
            products = Product.objects.filter(type=category)
        else:
            products = Product.objects.all()
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Obtener estadísticas de un producto específico"""
        product = self.get_object()
        transactions = Transaction.objects.filter(product=product)
        
        total_entries = transactions.filter(type='entrada').aggregate(
            total=Sum('quantity'))['total'] or 0
        total_exits = transactions.filter(type='salida').aggregate(
            total=Sum('quantity'))['total'] or 0
        total_revenue = transactions.filter(type='salida').aggregate(
            revenue=Sum('price'))['revenue'] or 0
        
        stats = {
            'product_id': product.id,
            'product_name': product.name,
            'total_entries': total_entries,
            'total_exits': total_exits,
            'current_stock': product.quantity,
            'total_revenue': total_revenue
        }
        
        serializer = ProductStatsSerializer(stats)
        return Response(serializer.data)


class TransactionViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de transacciones"""
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """Crear transacción con validación de stock mínimo"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Obtener el producto y tipo de transacción
        product = serializer.validated_data.get('product')
        transaction_type = serializer.validated_data.get('type')
        quantity = serializer.validated_data.get('quantity')

        warnings = []

        # Verificar stock mínimo para transacciones de salida
        if transaction_type == 'salida':
            stock_after_transaction = product.quantity - quantity

            if stock_after_transaction <= product.minimum_stock:
                warnings.append({
                    'type': 'low_stock_warning',
                    'message': f'ALERTA: Después de esta transacción, el producto "{product.name}" quedará en stock mínimo o por debajo.',
                    'current_stock': product.quantity,
                    'stock_after': stock_after_transaction,
                    'minimum_stock': product.minimum_stock
                })

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        response_data = serializer.data
        if warnings:
            response_data['warnings'] = warnings

        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        # Asignar el usuario actual a la transacción
        serializer.save(user=self.request.user)

    def get_queryset(self):
        queryset = Transaction.objects.all()
        
        # Filtros opcionales
        product_id = self.request.query_params.get('product', None)
        transaction_type = self.request.query_params.get('type', None)
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if product_id is not None:
            queryset = queryset.filter(product_id=product_id)
        if transaction_type is not None:
            queryset = queryset.filter(type=transaction_type)
        if date_from is not None:
            queryset = queryset.filter(date__gte=date_from)
        if date_to is not None:
            queryset = queryset.filter(date__lte=date_to)
            
        return queryset.order_by('-date')

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Obtener transacciones recientes (últimos 30 días)"""
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_transactions = Transaction.objects.filter(
            date__gte=thirty_days_ago
        ).order_by('-date')[:20]
        serializer = self.get_serializer(recent_transactions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_user(self, request):
        """Obtener transacciones del usuario actual"""
        user_transactions = Transaction.objects.filter(
            user=request.user
        ).order_by('-date')
        serializer = self.get_serializer(user_transactions, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """Endpoint para estadísticas del dashboard"""
    total_products = Product.objects.count()
    total_transactions = Transaction.objects.count()
    low_stock_count = Product.objects.filter(quantity__lte=F('minimum_stock'), is_active=True).count()
    total_revenue = Transaction.objects.filter(type='salida').aggregate(
        revenue=Sum('price'))['revenue'] or 0
    
    recent_transactions = Transaction.objects.order_by('-date')[:5]
    
    stats = {
        'total_products': total_products,
        'total_transactions': total_transactions,
        'low_stock_count': low_stock_count,
        'total_revenue': total_revenue,
        'recent_transactions': TransactionSerializer(recent_transactions, many=True).data
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def product_chart_data(request, product_id):
    """Endpoint para datos de gráfica de un producto específico"""
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    # Obtener transacciones de los últimos 30 días
    thirty_days_ago = timezone.now() - timedelta(days=30)
    transactions = Transaction.objects.filter(
        product=product,
        date__gte=thirty_days_ago
    ).order_by('date')
    
    # Agrupar por día
    chart_data = []
    current_stock = product.quantity
    
    # Calcular stock histórico día por día
    for i in range(30):
        date = thirty_days_ago + timedelta(days=i)
        day_transactions = transactions.filter(date__date=date.date())
        
        entries = day_transactions.filter(type='entrada').aggregate(
            total=Sum('quantity'))['total'] or 0
        exits = day_transactions.filter(type='salida').aggregate(
            total=Sum('quantity'))['total'] or 0
        
        # Para el stock histórico, necesitaríamos calcularlo desde el inicio
        # Por simplicidad, usaremos el stock actual como referencia
        stock_change = entries - exits
        
        chart_data.append({
            'date': date.date(),
            'entries': entries,
            'exits': exits,
            'stock_level': current_stock + stock_change
        })
    
    serializer = TransactionStatsSerializer(chart_data, many=True)
    return Response({
        'product': ProductSerializer(product).data,
        'chart_data': serializer.data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def inventory_overview_chart(request):
    """Endpoint para gráfica general del inventario por producto"""
    # Obtener todos los productos activos
    products = Product.objects.filter(is_active=True).order_by('name')

    chart_data = []
    for product in products:
        chart_data.append({
            'name': product.name,
            'quantity': product.quantity,
            'minimum_stock': product.minimum_stock,
            'is_low_stock': product.is_low_stock,
            'reference': product.reference
        })

    return Response(chart_data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def category_distribution(request):
    """Endpoint para distribución de productos por categoría"""
    categories = Product.objects.values('type').annotate(
        count=Count('id'),
        total_stock=Sum('quantity')
    ).order_by('-count')
    
    return Response(categories)


class SupplierViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de proveedores"""
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Supplier.objects.all()

        # Filtros opcionales
        supplier_type = self.request.query_params.get('type', None)
        search = self.request.query_params.get('search', None)

        if supplier_type and supplier_type != 'Todos':
            queryset = queryset.filter(type=supplier_type)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(contact__icontains=search) |
                Q(email__icontains=search)
            )

        return queryset.order_by('name')

    def destroy(self, request, *args, **kwargs):
        """Prevenir eliminación si el proveedor está registrado en transacciones"""
        supplier = self.get_object()

        # Verificar si el proveedor está en alguna transacción
        has_transactions = Transaction.objects.filter(supplier=supplier.name).exists()

        if has_transactions:
            return Response({
                'error': 'No se puede eliminar este proveedor porque tiene transacciones registradas.',
                'detail': 'Para mantener la integridad de los datos, considere inactivar el proveedor en lugar de eliminarlo.',
                'can_deactivate': True,
                'supplier_id': supplier.id
            }, status=status.HTTP_400_BAD_REQUEST)

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Inactivar un proveedor"""
        supplier = self.get_object()
        supplier.is_active = False
        supplier.save()
        return Response({
            'message': f'Proveedor "{supplier.name}" inactivado exitosamente',
            'supplier': self.get_serializer(supplier).data
        })

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activar un proveedor"""
        supplier = self.get_object()
        supplier.is_active = True
        supplier.save()
        return Response({
            'message': f'Proveedor "{supplier.name}" activado exitosamente',
            'supplier': self.get_serializer(supplier).data
        })

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Obtener proveedores agrupados por tipo"""
        supplier_type = request.query_params.get('type', None)
        if supplier_type:
            suppliers = Supplier.objects.filter(type=supplier_type)
        else:
            suppliers = Supplier.objects.all()
        serializer = self.get_serializer(suppliers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Obtener estadísticas de proveedores"""
        total_suppliers = Supplier.objects.count()
        national_count = Supplier.objects.filter(type='Nacional').count()
        international_count = Supplier.objects.filter(type='Internacional').count()

        stats = {
            'total_suppliers': total_suppliers,
            'national_count': national_count,
            'international_count': international_count,
            'recent_suppliers': SupplierSerializer(
                Supplier.objects.order_by('-registration_date')[:5], many=True
            ).data
        }

        return Response(stats)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Vista personalizada para JWT que incluye información del usuario"""
    serializer_class = CustomTokenObtainPairSerializer
