# Generated by Django 4.2.4 on 2023-09-17 23:37

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="customusermodel",
            options={"verbose_name": "User", "verbose_name_plural": "Users"},
        ),
    ]
