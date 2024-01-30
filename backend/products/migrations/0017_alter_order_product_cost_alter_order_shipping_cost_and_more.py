# Generated by Django 4.2.4 on 2023-10-06 09:10

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0016_order_orderitem"),
    ]

    operations = [
        migrations.AlterField(
            model_name="order",
            name="product_cost",
            field=models.DecimalField(decimal_places=2, max_digits=8),
        ),
        migrations.AlterField(
            model_name="order",
            name="shipping_cost",
            field=models.DecimalField(decimal_places=2, max_digits=6),
        ),
        migrations.AlterField(
            model_name="orderitem",
            name="cart",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="order_item",
                to="products.cart",
            ),
        ),
    ]