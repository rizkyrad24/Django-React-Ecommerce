from rest_framework import serializers
from .models import *

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryProduct
        fields = ["id", "category", "slug"]


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ["id", "address_name", "name", "phone", "user", "detail_address", "area", "area_id", "suburb", "suburb_id", "city", "city_id", "state", "state_id", "country", "country_id", "latitude", "longlitude", "date_add"]

class ProductPictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductPicture
        fields = ["id", "product", "picture"]


class ProductDetailtSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source="category.category")
    seller_name = serializers.ReadOnlyField(source="seller.full_name")
    pictures = ProductPictureSerializer(source="mypicture", many=True, read_only=True)
    address_detail = AddressSerializer(source="address", read_only=True)
    class Meta:
        model = ProductInfo
        fields = ["id", "title", "category", "category_name", "seller", "seller_name", "description", "width", "height", "length", "weight", "uploaded", "price", "stock", "sold", "is_active", "address", "address_detail", "slug", "pictures",]
    

class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source="category.category")
    seller_name = serializers.ReadOnlyField(source="seller.full_name")
    pictures = ProductPictureSerializer(source="mypicture", many=True, read_only=True)
    class Meta:
        model = ProductInfo
        fields = ["id", "title", "category", "category_name", "seller", "seller_name", "price", "stock", "sold", "slug", "pictures",]   


class CartSerializer(serializers.ModelSerializer):
    products = ProductDetailtSerializer(source="product", read_only=True)
    class Meta:
        model = Cart
        fields = ["id", "user", "product", "products", "amount", "is_bought", "added"]


class OrderItemSerializer(serializers.ModelSerializer):
    cart_detail = CartSerializer(source="cart", read_only=True)
    class Meta:
        model = OrderItem
        fields = ["id", "order", "cart", "cart_detail", "date_add"]


class OrderSerializer(serializers.ModelSerializer):
    destination_detail = AddressSerializer(source="destination", read_only=True)
    origin_detail = AddressSerializer(source="origin", read_only=True)
    order_items = OrderItemSerializer(source="order_item", many=True, read_only=True)
    class Meta:
        model = Order
        fields = ["id", "customer", "seller", "transaction_id", "destination", "destination_detail", "origin", "origin_detail", "order_date", "product_cost", "shipping_cost", "courir", "weight", "length", "width", "height", "rate_id", "status", "order_items", "order_id_shipper"]


class ComplainPictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplainPicture
        fields = ["id", "complain", "picture", "uploaded",]


class ComplainSerializer(serializers.ModelSerializer):
    order_detail = OrderSerializer(source="order", read_only=True)
    complain_pictures = ComplainPictureSerializer(source="complain_picture", many=True, read_only=True)
    sender_name = serializers.ReadOnlyField(source="sender.full_name")
    class Meta:
        model = Complain
        fields = ["id", "order", "order_detail", "sender", "sender_name", "text", "status", "uploaded", "complain_pictures",]


class CartPlainPSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = ["id", "user", "product", "amount", "is_bought", "added",]


class ProductByCartSerializer(serializers.ModelSerializer):
    carts = CartPlainPSerializer(source="cart", many=True, read_only=True)
    seller_name = serializers.ReadOnlyField(source="seller.full_name")
    pictures = ProductPictureSerializer(source="mypicture", many=True, read_only=True)
    class Meta:
        model = ProductInfo
        fields = ["id", "title", "seller", "seller_name", "width", "height", "length", "weight", "price", "stock", "address", "pictures", "carts",]


class CheckoutByAddressSerializer(serializers.ModelSerializer):
    products = ProductByCartSerializer(source="product", many=True, read_only=True)
    class Meta:
        model = Address
        fields = ["id", "address_name", "user", "name", "phone", "detail_address", "area", "area_id", "suburb", "suburb_id", "city", "city_id", "state", "state_id", "country", "country_id", "latitude", "longlitude", "products",]