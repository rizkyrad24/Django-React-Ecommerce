# Generated by Django 4.2.4 on 2023-10-05 10:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0014_address_name_address_phone"),
    ]

    operations = [
        migrations.RemoveField(model_name="orderitem", name="cart",),
        migrations.RemoveField(model_name="orderitem", name="order",),
        migrations.DeleteModel(name="Order",),
        migrations.DeleteModel(name="OrderItem",),
    ]
