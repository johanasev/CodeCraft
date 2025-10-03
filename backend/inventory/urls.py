from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'roles', views.RoleViewSet)
router.register(r'users', views.UserViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'transactions', views.TransactionViewSet)

urlpatterns = [
    # Documentación API
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Autenticación JWT
    path('auth/jwt/login/', views.CustomTokenObtainPairView.as_view(), name='jwt_obtain_pair'),
    path('auth/jwt/refresh/', TokenRefreshView.as_view(), name='jwt_refresh'),
    
    # Autenticación tradicional (mantener compatibilidad)
    path('auth/login/', views.login_view, name='login'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/logout/', views.logout_view, name='logout'),
    
    # Dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    
    # Charts y gráficas
    path('charts/product/<int:product_id>/', views.product_chart_data, name='product_chart_data'),
    path('charts/inventory-overview/', views.inventory_overview_chart, name='inventory_overview_chart'),
    path('charts/category-distribution/', views.category_distribution, name='category_distribution'),
    
    # API REST
    path('api/', include(router.urls)),
]