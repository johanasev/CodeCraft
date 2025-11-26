from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.db.models import Sum, Count, Q
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

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Obtener productos con stock bajo (menos de 10 unidades)"""
        low_stock_products = Product.objects.filter(quantity__lt=10)
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
    low_stock_count = Product.objects.filter(quantity__lt=10).count()
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
    """Endpoint para gráfica general del inventario"""
    # Obtener datos de los últimos 7 días
    seven_days_ago = timezone.now() - timedelta(days=7)
    
    chart_data = []
    for i in range(7):
        date = seven_days_ago + timedelta(days=i)
        day_transactions = Transaction.objects.filter(date__date=date.date())
        
        total_entries = day_transactions.filter(type='entrada').aggregate(
            total=Sum('quantity'))['total'] or 0
        total_exits = day_transactions.filter(type='salida').aggregate(
            total=Sum('quantity'))['total'] or 0
        daily_revenue = day_transactions.filter(type='salida').aggregate(
            revenue=Sum('price'))['revenue'] or 0
        
        chart_data.append({
            'date': date.date(),
            'entries': total_entries,
            'exits': total_exits,
            'revenue': daily_revenue
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
