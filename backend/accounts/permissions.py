from rest_framework import permissions

class IsUserOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user
    

class IsUser(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
    
class IsCustomer(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.customer == request.user
    
class IsSeller(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.seller == request.user
    
class IsSender(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.sender == request.user
    
class IsPictureSeller(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.product.seller == request.user