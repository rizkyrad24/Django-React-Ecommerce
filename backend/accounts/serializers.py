from rest_framework import serializers
from .models import CustomUserModel

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUserModel
        fields = ["pk", "email", "first_name", "last_name", "is_active", "is_staff",]
