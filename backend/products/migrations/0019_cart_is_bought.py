# Generated by Django 4.2.4 on 2023-10-08 07:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0018_order_order_id_shipper_alter_order_status"),
    ]

    operations = [
        migrations.AddField(
            model_name="cart",
            name="is_bought",
            field=models.BooleanField(default=False),
        ),
    ]
