# Generated by Django 4.2.4 on 2023-10-09 00:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0019_cart_is_bought"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="courir",
            field=models.CharField(default="not set", max_length=100),
            preserve_default=False,
        ),
    ]
