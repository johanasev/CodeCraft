from django.contrib import admin
from .models import Role, User, Product, Transaction, Supplier

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at', 'updated_at')
    search_fields = ('name',)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_active', 'registration_date')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'size', 'quantity', 'price', 'reference')
    list_filter = ('type', 'size')
    search_fields = ('name', 'reference')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('product', 'type', 'quantity', 'price', 'date', 'user')
    list_filter = ('type', 'date')
    search_fields = ('product__name', 'supplier')

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'contact', 'phone', 'email', 'registration_date')
    list_filter = ('type', 'registration_date')
    search_fields = ('name', 'contact', 'email')
    readonly_fields = ('registration_date',)
