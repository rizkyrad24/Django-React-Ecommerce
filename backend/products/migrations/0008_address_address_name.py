# Generated by Django 4.2.4 on 2023-09-27 13:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0007_alter_address_area_alter_address_area_id_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="address",
            name="address_name",
            field=models.CharField(default="Undefine", max_length=200),
        ),
    ]
