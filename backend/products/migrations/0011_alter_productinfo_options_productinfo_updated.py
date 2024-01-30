# Generated by Django 4.2.4 on 2023-10-03 10:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0010_alter_productpicture_product"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="productinfo",
            options={"ordering": ("-updated",), "verbose_name_plural": "Product"},
        ),
        migrations.AddField(
            model_name="productinfo",
            name="updated",
            field=models.DateTimeField(auto_now=True),
        ),
    ]
