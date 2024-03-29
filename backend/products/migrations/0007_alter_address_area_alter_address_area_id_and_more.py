# Generated by Django 4.2.4 on 2023-09-27 09:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        (
            "products",
            "0006_remove_address_zipcode_address_area_address_area_id_and_more",
        ),
    ]

    operations = [
        migrations.AlterField(
            model_name="address", name="area", field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name="address", name="area_id", field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name="address", name="city", field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name="address", name="city_id", field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name="address",
            name="country",
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name="address", name="country_id", field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name="address",
            name="latitude",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name="address",
            name="longlitude",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name="address", name="state_id", field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name="address", name="suburb", field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name="address", name="suburb_id", field=models.IntegerField(),
        ),
    ]
