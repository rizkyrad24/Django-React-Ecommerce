from django.contrib import admin
from .models import *

# Register your models here.
class ProductAdmin(admin.ModelAdmin):
    search_fields = ("title",)
    list_display = ("id", "title", "stock", "price",)
    prepopulated_fields = {'slug': ('title',)}

class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('category',)}

class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "product", "is_bought",)
    list_filter = ("user",)

class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "transaction_id", "status",)
    search_fields = ("customer", "transaction_id",)
    list_filter = ("customer", "status",)

class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "cart",)
    list_filter = ("order",)

class ComplainAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "sender", "text", "status",)
    search_fields = ("order", "sender", "text",)
    list_filter = ("sender", "status",)

class ComplainPictureAdmin(admin.ModelAdmin):
    list_display = ("id", "complain",)
    list_filter = ("complain",)


admin.site.register(ProductInfo, ProductAdmin)
admin.site.register(CategoryProduct, CategoryAdmin)
admin.site.register(ProductPicture)
admin.site.register(Cart, CartAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(OrderItem, OrderItemAdmin)
admin.site.register(Address)
admin.site.register(Complain, ComplainAdmin)
admin.site.register(ComplainPicture, ComplainPictureAdmin)