# Generated by Django 4.2.4 on 2023-10-05 07:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0013_remove_order_complete_order_product_cost_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="address",
            name="name",
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name="address",
            name="phone",
            field=models.CharField(default="Not Set", max_length=15),
            preserve_default=False,
        ),
    ]
