# Generated by Django 4.2.4 on 2023-09-20 19:56

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("products", "0002_cart"),
    ]

    operations = [
        migrations.CreateModel(
            name="Address",
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
                ("detail_address", models.TextField()),
                ("city", models.CharField(max_length=200)),
                ("state", models.CharField(max_length=200)),
                ("zipcode", models.CharField(max_length=20)),
                ("date_add", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="address",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Order",
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
                ("transaction_id", models.CharField(blank=True, max_length=200)),
                ("order_date", models.DateTimeField(auto_now_add=True)),
                ("shipping_cost", models.DecimalField(decimal_places=2, max_digits=6)),
                (
                    "address",
                    models.OneToOneField(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to="products.address",
                    ),
                ),
                (
                    "customer",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="order",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.AlterField(
            model_name="productinfo",
            name="category",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="product_info",
                to="products.categoryproduct",
            ),
        ),
        migrations.AlterField(
            model_name="productinfo",
            name="price",
            field=models.DecimalField(
                decimal_places=2, max_digits=8, verbose_name="Product Price"
            ),
        ),
        migrations.CreateModel(
            name="OrderItem",
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
                ("date_add", models.DateTimeField(auto_now_add=True)),
                (
                    "cart",
                    models.OneToOneField(
                        default=12,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="order_item",
                        to="products.cart",
                    ),
                ),
                (
                    "order",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="order_item",
                        to="products.order",
                    ),
                ),
            ],
        ),
    ]
