# Generated by Django 4.2.4 on 2023-09-14 05:09

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="CategoryProduct",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "category",
                    models.CharField(
                        max_length=255, unique=True, verbose_name="Category Product"
                    ),
                ),
                ("added", models.DateTimeField(auto_now_add=True)),
                ("slug", models.SlugField(max_length=255, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name="ProductInfo",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "title",
                    models.CharField(max_length=256, verbose_name="Product Name"),
                ),
                (
                    "description",
                    models.TextField(blank=True, verbose_name="Product Description"),
                ),
                ("uploaded", models.DateTimeField(auto_now_add=True)),
                (
                    "price",
                    models.DecimalField(
                        decimal_places=2, max_digits=4, verbose_name="Product Price"
                    ),
                ),
                ("stock", models.IntegerField(default=0, verbose_name="Stock Product")),
                (
                    "sold",
                    models.IntegerField(default=0, verbose_name="Amount Product Sold"),
                ),
                ("is_active", models.BooleanField(default=True)),
                ("slug", models.SlugField(max_length=255, unique=True)),
                (
                    "category",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="product_info",
                        to="products.categoryproduct",
                    ),
                ),
                (
                    "seller",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"verbose_name_plural": "Product", "ordering": ("-uploaded",),},
        ),
        migrations.CreateModel(
            name="ProductPicture",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "picture",
                    models.ImageField(
                        upload_to="product", verbose_name="Product Image"
                    ),
                ),
                ("uploaded", models.DateTimeField(auto_now_add=True)),
                (
                    "product",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="picture",
                        to="products.productinfo",
                    ),
                ),
            ],
        ),
    ]
