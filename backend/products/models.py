from collections.abc import Iterable
from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import CustomUserModel
from django.utils.crypto import get_random_string
import string

# Create your models here.
class CategoryProduct(models.Model):
    category = models.CharField(_("Category Product"), max_length=255, unique=True)
    added = models.DateTimeField(auto_now_add=True)
    slug = models.SlugField(max_length=255, unique=True)
    
    def __str__(self):
        return self.category

class Address(models.Model):
    user = models.ForeignKey(CustomUserModel, on_delete=models.CASCADE, related_name="address")
    address_name = models.CharField(max_length=200, default="Undefine")
    name = models.CharField(max_length=50, blank=True, null=True)
    phone = models.CharField(max_length=15)
    detail_address = models.TextField()
    area = models.CharField(max_length=100)
    area_id = models.IntegerField()
    suburb = models.CharField(max_length=100)
    suburb_id = models.IntegerField()
    city = models.CharField(max_length=100)
    city_id = models.IntegerField()
    state = models.CharField(max_length=100)
    state_id = models.IntegerField()
    country = models.CharField(max_length=100)
    country_id = models.IntegerField()
    latitude = models.CharField(max_length=100, blank=True, null=True)
    longlitude = models.CharField(max_length=100, blank=True, null=True)
    date_add = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.pk}, {self.user}, {self.address_name}"

class ProductInfo(models.Model):
    title = models.CharField(_("Product Name"), max_length = 256)
    category = models.ForeignKey(CategoryProduct, on_delete=models.SET_NULL, null=True, blank=True, related_name="product_info")
    seller = models.ForeignKey(CustomUserModel, on_delete=models.CASCADE, related_name="product_info")
    description = models.TextField(_("Product Description"), blank=True)
    width = models.FloatField(default=0)
    height = models.FloatField(default=0)
    length = models.FloatField(default=0)
    weight = models.FloatField(default=0)
    uploaded = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    price = models.DecimalField(_("Product Price"), decimal_places=2, max_digits=8)
    stock = models.IntegerField(_("Stock Product"), default=0)
    sold = models.IntegerField(_("Amount Product Sold"), default=0)
    is_active = models.BooleanField(default=True)
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, related_name="product")
    slug = models.SlugField(max_length=255, unique=True)

    class Meta:
        verbose_name_plural = "Product"
        ordering = ('-updated',)

    def product_sold(self, amount):
        self.stock = self.stock - amount
        self.sold = self.sold + amount

    def save(self, *args, **kwargs):
        if self.price < 0:
            self.price = 0
        if self.stock < 0:
            self.stock = 0
        return super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title


class ProductPicture(models.Model):
    product = models.ForeignKey(ProductInfo, on_delete=models.CASCADE, related_name="mypicture")
    picture = models.ImageField(_("Product Image"), upload_to="product")
    uploaded = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.product.title
    
    
class Cart(models.Model):
    user = models.ForeignKey(CustomUserModel, on_delete=models.CASCADE, related_name="cart")
    product = models.ForeignKey(ProductInfo, on_delete=models.CASCADE, related_name="cart")
    amount = models.IntegerField(_("Number Of Product"), default=0)
    is_bought = models.BooleanField(default=False)
    added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product}, {self.amount} pcs"


class Order(models.Model):
    customer = models.ForeignKey(CustomUserModel, on_delete=models.SET_NULL, related_name="order_customer", null=True)
    seller = models.ForeignKey(CustomUserModel, on_delete=models.SET_NULL, related_name="order_seller", null=True)
    transaction_id = models.CharField(max_length=200, blank=True, unique=True)
    destination = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, related_name="destination")
    origin = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, related_name="origin")
    order_date = models.DateTimeField(auto_now_add=True)
    product_cost = models.DecimalField(decimal_places=2, max_digits=8)
    shipping_cost = models.DecimalField(decimal_places=2, max_digits=6)
    courir = models.CharField(max_length=100)
    weight = models.FloatField()
    length = models.FloatField()
    width = models.FloatField()
    height = models.FloatField()
    rate_id = models.IntegerField()
    STATUS = (
        ("0", "Hasn't Paid"),
        ("1", "Payment Verified"),
        ("2", "Processing"),
        ("3", "Delivering"),
        ("4", "Complete"),
        ("5", "Complained"),
    )
    status = models.CharField(choices=STATUS, max_length=2, default="0")
    order_id_shipper = models.CharField(max_length=100, null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.transaction_id == "":
            self.transaction_id = get_random_string(20, allowed_chars=string.ascii_uppercase + string.digits)
        return super(Order, self).save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.transaction_id}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="order_item")
    cart = models.ForeignKey(Cart, on_delete=models.SET_NULL, null=True, related_name="order_item")
    date_add = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.cart}"
    

class Complain(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="complain")
    sender = models.ForeignKey(CustomUserModel, on_delete=models.CASCADE, related_name="complain")
    text = models.TextField()
    STATUS = (
        ("0", "Created"),
        ("1", "Processed"),
        ("2", "Completed")
    )
    status = models.CharField(choices=STATUS, max_length=2, default="0")
    uploaded = models.DateTimeField(auto_now_add=True)


class ComplainPicture(models.Model):
    complain = models.ForeignKey(Complain, on_delete=models.CASCADE, related_name="complain_picture")
    picture = models.ImageField(upload_to="complained")
    uploaded = models.DateTimeField(auto_now_add=True)