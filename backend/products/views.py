from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.db.models import Q
from .serializers import CategorySerializer, ProductListSerializer, ProductDetailtSerializer, CartSerializer, AddressSerializer, ProductPictureSerializer, CheckoutByAddressSerializer, OrderSerializer, OrderItemSerializer, ComplainSerializer
from .models import CategoryProduct, ProductInfo, Cart, Address, ProductPicture, Order, OrderItem, Complain, ComplainPicture
from accounts.models import CustomUserModel
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsUserOrReadOnly, IsUser, IsCustomer, IsSeller, IsPictureSeller, IsSender
import json
import requests
from rest_framework.parsers import MultiPartParser, FormParser

# Create your views here.
class ProductListView(generics.ListAPIView):
    queryset = ProductInfo.objects.all()
    serializer_class = ProductListSerializer

    def get(self, request, *args, **kwargs):
        self.queryset = ProductInfo.objects.filter(is_active=True)
        return self.list(request, *args, **kwargs)


class MyProductListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = ProductInfo.objects.all()
    serializer_class = ProductDetailtSerializer

    def get(self, request, *args, **kwargs):
        self.queryset = ProductInfo.objects.filter(seller= request.user)
        return self.list(request, *args, **kwargs)


class ProductListFilterView(generics.ListAPIView):
    queryset = ProductInfo.objects.all()
    serializer_class = ProductListSerializer

    def get(self, request, *args, **kwargs):
        category = CategoryProduct.objects.get(slug=kwargs['slug'])
        self.queryset = ProductInfo.objects.filter(category=category).filter(is_active=True)
        return self.list(request, args, kwargs)
    
class ProductListSearchView(generics.ListAPIView):
    queryset = ProductInfo.objects.all()
    serializer_class = ProductListSerializer

    def search(self, request):
        keyword = request.GET.get('keyword')
        keyword_list = keyword.split("+")
        q_object = Q(title__icontains=keyword_list[0]) | Q(description__icontains=keyword_list[0])
        for key in keyword_list[1:]:
            q_object.add((Q(title__icontains=key) | Q(description__icontains=key)), q_object.connector)
        return q_object

    def get(self, request, *args, **kwargs):
        keyword = self.search(request)
        self.queryset = ProductInfo.objects.filter(keyword).order_by("-id").filter(is_active=True)
        return self.list(request, *args, **kwargs)


class ProductDetailView(APIView):
    def get(self, request, *args, **kwargs):
        product = ProductInfo.objects.get(slug=kwargs['slug'])
        serializer = ProductDetailtSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
class ProductEditDeleteView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsSeller]
    queryset = ProductInfo.objects.all()
    serializer_class = ProductDetailtSerializer


class CategoryProductView(generics.ListAPIView):
    queryset = CategoryProduct.objects.all()
    serializer_class = CategorySerializer


class CartView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        cartlist = Cart.objects.filter(user=kwargs["pk"]).filter(is_bought=False)
        serializer = CartSerializer(cartlist, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        carts = request.data
        try:
            cartlist = Cart.objects.filter(user=kwargs["pk"]).filter(id__in=carts['data'])
            serializer = CartSerializer(cartlist, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except:
            return Response({"message": "Carts or user not found"}, status=status.HTTP_404_NOT_FOUND)
    

class AddCartView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        serializer = CartSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

class UpdateDeleteCartView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated, IsUser]


class MultipleDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        carts = request.data
        try:
            cart_list = Cart.objects.filter(id__in=carts['data'])
            cart_user = cart_list.values_list('user', flat=True).distinct()[0]
            if cart_user == request.user.id:
                cart_list.delete()
                return Response({"message": "Carts have been deleted"}, status=status.HTTP_202_ACCEPTED)
            return Response({"message": "You cannot delete carts of other user"}, status=status.HTTP_406_NOT_ACCEPTABLE)
        except:
            return Response({"message": "Carts not found"}, status=status.HTTP_404_NOT_FOUND)
        

class ChangeCartToBoughtView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        carts = request.data
        try:
            cart_list = Cart.objects.filter(id__in=carts['data'])
            cart_user = cart_list.values_list('user', flat=True).distinct()[0]
            if cart_user == request.user.id:
                for cart in cart_list:
                    cart.is_bought = True
                    cart.save()
                return Response({"message": "Carts have been bought"}, status=status.HTTP_202_ACCEPTED)
            return Response({"message": "You cannot delete carts of other user"}, status=status.HTTP_406_NOT_ACCEPTABLE)
        except:
            return Response({"message": "Carts not found"}, status=status.HTTP_404_NOT_FOUND)
        

class AddressListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Address.objects.all()
    serializer_class = AddressSerializer

    def get(self, request, *args, **kwargs):
        self.queryset = Address.objects.filter(user=request.user.pk)
        return super().get(request, *args, **kwargs)

class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsUserOrReadOnly]
    queryset = Address.objects.all()
    serializer_class = AddressSerializer


class MultipleOrderItemView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        raw_data = request.data
        carts = raw_data['carts']
        # cek input
        try:
            customer = CustomUserModel.objects.get(id=raw_data['customer'])
        except CustomUserModel.DoesNotExist:
            return Response({"message": "Customer does not exist"}, status=status.HTTP_404_NOT_FOUND)
        try:
            seller = CustomUserModel.objects.get(id=raw_data['seller'])
        except CustomUserModel.DoesNotExist:
            return Response({"message": "Seller does not exist"}, status=status.HTTP_404_NOT_FOUND)
        try:
            destination = Address.objects.get(id=raw_data['destination'])
        except Address.DoesNotExist:
            return Response({"message": "destination does not exist"}, status=status.HTTP_404_NOT_FOUND)
        try:
            origin = Address.objects.get(id=raw_data['origin'])
        except Address.DoesNotExist:
            return Response({"message": "origin does not exist"}, status=status.HTTP_404_NOT_FOUND)
        try: 
            carts_obj = Cart.objects.filter(id__in=carts)
        except:
            return Response({"message": "Order does not exist"}, status=status.HTTP_404_NOT_FOUND)
        # cek product cart
        for obj in carts_obj:
            if obj.amount > obj.product.stock:
                return Response({"message": f"product with id {obj.product.pk} is out of stock"})
        # create order
        initial_order = Order.objects.create(customer=customer,seller=seller,destination=destination,origin=origin,product_cost=raw_data['product_cost'],shipping_cost=raw_data['shipping_cost'],weight=raw_data['weight'],length=raw_data['length'],width=raw_data['width'],height=raw_data['height'],rate_id=raw_data['rate_id'],courir=raw_data['courir'])
        order = Order.objects.get(id=initial_order.pk)
        bulk_list = list()
        for cart_obj in carts_obj:
            bulk_list.append(OrderItem(order=order, cart=cart_obj))
            product = cart_obj.product
            product.stock = product.stock - cart_obj.amount
            product.save()
        OrderItem.objects.bulk_create(bulk_list)
        return Response({"message": "Objects were created", "transaction_id": initial_order.transaction_id }, status=status.HTTP_201_CREATED)


class OrderListView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        data = request.data['data']
        try:
            order_list = Order.objects.filter(transaction_id__in=data)
            serializer = OrderSerializer(order_list, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except:
            return Response({"message": "Data not found"}, status=status.HTTP_400_BAD_REQUEST)
        

class AddOrderIdShipperView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        transaction_id = request.data['transaction_id']
        order_id_shipper = request.data['order_id_shipper']
        try:
            order = Order.objects.get(transaction_id=transaction_id)
            order.order_id_shipper = order_id_shipper
            order.save()
            return Response({"message": "Order Id Shipper has added"}, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({"message": "Data not found"}, status=status.HTTP_400_BAD_REQUEST)


class OrderListCustomerSideView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get(self, request, *args, **kwargs):
        self.queryset = Order.objects.filter(customer=request.user)
        return self.list(request, *args, **kwargs)
    
class OrderListSellerSideView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get(self, request, *args, **kwargs):
        self.queryset = Order.objects.filter(seller=request.user)
        return self.list(request, *args, **kwargs)


class OrderComplainedAdminView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get(self, request, *args, **kwargs):
        self.queryset = Order.objects.filter(status="5")
        return self.list(request, *args, **kwargs)
    

class OrderUncompleteCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        order_amount = Order.objects.filter(customer=request.user).exclude(status=4).count()
        return Response({'amount_order': order_amount}, status=status.HTTP_200_OK)


class OrderChangePaymentVerified(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        data = request.data['data']
        try:
            order_list = Order.objects.filter(transaction_id__in=data)
            for order in order_list:
                order.status = "1"
                order.save()
            return Response({"message": "Order status has changed to be Payment Verified"}, status=status.HTTP_200_OK)
        except:
            return Response({"message": "Data not found"}, status=status.HTTP_400_BAD_REQUEST)
        

class OrderChangeProcessing(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        data = request.data['data']
        try:
            order_list = Order.objects.filter(transaction_id__in=data)
            for order in order_list:
                order.status = "2"
                order.save()
            return Response({"message": "Order status has changed to be Processing"}, status=status.HTTP_200_OK)
        except:
            return Response({"message": "Data not found"}, status=status.HTTP_400_BAD_REQUEST)
        

class OrderChangeDelivering(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        data = request.data['data']
        try:
            order_list = Order.objects.filter(transaction_id__in=data)
            for order in order_list:
                order.status = "3"
                order.save()
            return Response({"message": "Order status has changed to be Delivering"}, status=status.HTTP_200_OK)
        except:
            return Response({"message": "Data not found"}, status=status.HTTP_400_BAD_REQUEST)
        

class OrderChangeComplete(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        data = request.data['data']
        try:
            order = Order.objects.get(transaction_id=data)
            order.status = "4"
            order.save()
            for item in order.order_item.all(): # pyright: ignore[reportGeneralTypeIssues]
                product = item.cart.product
                product.sold = product.sold + item.cart.amount
                product.save()
            return Response({"message": "Order status has changed to be Complete"}, status=status.HTTP_200_OK)
        except Order.DoesNotExist :
            return Response({"message": "Data not found"}, status=status.HTTP_400_BAD_REQUEST)
        

class OrderChangeComplained(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        data = request.data['data']
        try:
            order = Order.objects.get(transaction_id=data)
            order.status = "5"
            order.save()
            return Response({"message": "Order status has changed to be Complained"}, status=status.HTTP_200_OK)
        except:
            return Response({"message": "Data not found"}, status=status.HTTP_400_BAD_REQUEST)


class GetCountryFromShipper(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, **kwargs):
        url = "https://merchant-api-sandbox.shipper.id/v3/location/countries"
        headers = {
        "X-API-Key": "lwNbyh4vwKI8xjWSv6c5GayIk4te84BKhgsbJv1C6Oq0G3pWDGtetzupbUENvdsP"
        }
        response = requests.request("GET", url, headers=headers)
        raw_data = response.json()
        data = raw_data['data']
        pages = raw_data['pagination']['total_pages']
        if pages > 1:
            list_pages = list(range(2, (pages+1)))
            for i in list_pages:
                res = requests.request("GET", (url + "?page=" + str(i)), headers=headers)
                data = data + (res.json()['data'])
        return Response(data, status=status.HTTP_200_OK)


class GetStateFromShipper(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, **kwargs):
        url = f"https://merchant-api-sandbox.shipper.id/v3/location/country/{kwargs['country']}/provinces"
        headers = {
        "X-API-Key": "lwNbyh4vwKI8xjWSv6c5GayIk4te84BKhgsbJv1C6Oq0G3pWDGtetzupbUENvdsP"
        }
        response = requests.request("GET", url, headers=headers)
        raw_data = response.json()
        data = raw_data['data']
        pages = raw_data['pagination']['total_pages']
        if pages > 1:
            list_pages = list(range(2, (pages+1)))
            for i in list_pages:
                res = requests.request("GET", (url + "?page=" + str(i)), headers=headers)
                data = data + (res.json()['data'])
        return Response(data, status=status.HTTP_200_OK)
    

class GetCityFromShipper(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, **kwargs):
        url = f"https://merchant-api-sandbox.shipper.id/v3/location/province/{kwargs['state']}/cities"
        headers = {
        "X-API-Key": "lwNbyh4vwKI8xjWSv6c5GayIk4te84BKhgsbJv1C6Oq0G3pWDGtetzupbUENvdsP"
        }
        response = requests.request("GET", url, headers=headers)
        raw_data = response.json()
        data = raw_data['data']
        pages = raw_data['pagination']['total_pages']
        if pages > 1:
            list_pages = list(range(2, (pages+1)))
            for i in list_pages:
                res = requests.request("GET", (url + "?page=" + str(i)), headers=headers)
                data = data + (res.json()['data'])
        return Response(data, status=status.HTTP_200_OK)


class GetSuburbFromShipper(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, **kwargs):
        url = f"https://merchant-api-sandbox.shipper.id/v3/location/city/{kwargs['city']}/suburbs"
        headers = {
        "X-API-Key": "lwNbyh4vwKI8xjWSv6c5GayIk4te84BKhgsbJv1C6Oq0G3pWDGtetzupbUENvdsP"
        }
        response = requests.request("GET", url, headers=headers)
        raw_data = response.json()
        data = raw_data['data']
        pages = raw_data['pagination']['total_pages']
        if pages > 1:
            list_pages = list(range(2, (pages+1)))
            for i in list_pages:
                res = requests.request("GET", (url + "?page=" + str(i)), headers=headers)
                data = data + (res.json()['data'])
        return Response(data, status=status.HTTP_200_OK)


class GetAreaFromShipper(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, **kwargs):
        url = f"https://merchant-api-sandbox.shipper.id/v3/location/suburb/{kwargs['suburb']}/areas"
        headers = {
        "X-API-Key": "lwNbyh4vwKI8xjWSv6c5GayIk4te84BKhgsbJv1C6Oq0G3pWDGtetzupbUENvdsP"
        }
        response = requests.request("GET", url, headers=headers)
        raw_data = response.json()
        data = raw_data['data']
        pages = raw_data['pagination']['total_pages']
        if pages > 1:
            list_pages = list(range(2, (pages+1)))
            for i in list_pages:
                res = requests.request("GET", (url + "?page=" + str(i)), headers=headers)
                data = data + (res.json()['data'])
        return Response(data, status=status.HTTP_200_OK)
    

class PriceCheckView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, **kwargs):
        payload = request.data
        url = f"https://merchant-api-sandbox.shipper.id/v3/pricing/domestic/"
        headers = {
        "X-API-Key": "lwNbyh4vwKI8xjWSv6c5GayIk4te84BKhgsbJv1C6Oq0G3pWDGtetzupbUENvdsP"
        }
        response = requests.request("post", url, json=payload, headers=headers)
        raw_data = response.json()
        data = raw_data['data']
        pages = raw_data['pagination']['total_pages']
        if pages > 1:
            list_pages = list(range(2, (pages+1)))
            for i in list_pages:
                res = requests.request("GET", (url + "?page=" + str(i)), headers=headers)
                data = data + (res.json()['data'])
        return Response(data, status=status.HTTP_200_OK)


class OrderShippingBackendProcess(APIView):
    permission_classes = [IsAuthenticated, IsSeller]
    def post(self, request):
        data_input = request.data['data']
        order = Order.objects.get(transaction_id=data_input)
        order_items = OrderItem.objects.filter(order=order)
        package_type = None
        if (order.length * order.width * order.height) < 2000:
            package_type = 1
        elif (order.length * order.width * order.height) < 50000:
            package_type = 2
        else:
            package_type = 3
        list = []
        for item in order_items:
            cart = Cart.objects.get(id=item.cart.pk) # pyright: ignore[reportOptionalMemberAccess]
            product = ProductInfo.objects.get(id=cart.product.pk)
            dict = {
                "name": product.title,
                "price": int(product.price),
                "qty": cart.amount
            }
            list.append(dict)
        payload = {
            "consignee": {
                "name": order.destination.name, # pyright: ignore[reportOptionalMemberAccess]
                "phone_number": order.destination.phone # pyright: ignore[reportOptionalMemberAccess]
            },
            "consigner": {
                "name": order.origin.name, # pyright: ignore[reportOptionalMemberAccess]
                "phone_number": order.origin.phone # pyright: ignore[reportOptionalMemberAccess]
            },
            "courier": {
                "cod": False,
                "rate_id": order.rate_id,
                "use_insurance": True
            },
            "coverage": "domestic",
            "destination": {
                "address": order.destination.detail_address, # pyright: ignore[reportOptionalMemberAccess]
                "area_id": order.destination.area_id, # pyright: ignore[reportOptionalMemberAccess]
                "lat": order.destination.latitude, # pyright: ignore[reportOptionalMemberAccess]
                "lng": order.destination.longlitude # pyright: ignore[reportOptionalMemberAccess]
            },
            "external_id": order.transaction_id,
            "origin": {
                "address": order.origin.detail_address, # pyright: ignore[reportOptionalMemberAccess]
                "area_id": order.origin.area_id, # pyright: ignore[reportOptionalMemberAccess]
                "lat": order.origin.latitude, # pyright: ignore[reportOptionalMemberAccess]
                "lng": order.origin.longlitude # pyright: ignore[reportOptionalMemberAccess]
            },
            "package": {
                "height": order.height,
                "items": list,
                "length": order.length,
                "package_type": package_type,
                "price": int(order.product_cost),
                "weight": order.weight,
                "width": order.width
            },
            "payment_type": "postpay"
        }
        url = f"https://merchant-api-sandbox.shipper.id/v3/order"
        headers = {
        "X-API-Key": "lwNbyh4vwKI8xjWSv6c5GayIk4te84BKhgsbJv1C6Oq0G3pWDGtetzupbUENvdsP"
        }
        response = requests.request("post", url, json=payload, headers=headers)
        raw_data = response.json()
        data = raw_data['data']
        order.order_id_shipper = data['order_id']
        order.save()
        return Response(data, status=status.HTTP_200_OK)


class OrderShippingView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, **kwargs):
        payload = request.data
        url = f"https://merchant-api-sandbox.shipper.id/v3/order"
        headers = {
        "X-API-Key": "lwNbyh4vwKI8xjWSv6c5GayIk4te84BKhgsbJv1C6Oq0G3pWDGtetzupbUENvdsP"
        }
        response = requests.request("post", url, json=payload, headers=headers)
        raw_data = response.json()
        data = raw_data['data']
        return Response(data, status=status.HTTP_200_OK)


class RequestPickUpView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, **kwargs):
        payload = request.data
        url = f"https://merchant-api-sandbox.shipper.id/v3/pickup"
        headers = {
        "X-API-Key": "lwNbyh4vwKI8xjWSv6c5GayIk4te84BKhgsbJv1C6Oq0G3pWDGtetzupbUENvdsP"
        }
        response = requests.request("post", url, json=payload, headers=headers)
        raw_data = response.json()
        # data = raw_data['data']
        return Response(raw_data, status=status.HTTP_200_OK)
    

class CheckResiShipperView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, **kwargs):
        url = f"https://merchant-api-sandbox.shipper.id/v3/order/{kwargs['shipper_id']}"
        headers = {
        "X-API-Key": "lwNbyh4vwKI8xjWSv6c5GayIk4te84BKhgsbJv1C6Oq0G3pWDGtetzupbUENvdsP"
        }
        response = requests.request("GET", url, headers=headers)
        raw_data = response.json()
        data = raw_data['data']
        return Response(data, status=status.HTTP_200_OK)

class DeleteOrderView(APIView):
    permission_classes = [IsAuthenticated, IsSeller]
    def delete(self, request, **kwargs):
        order = Order.objects.get(transaction_id=kwargs['transaction_id'])
        if order.order_id_shipper is not None:
            url = f"https://merchant-api-sandbox.shipper.id/v3/order/{order.order_id_shipper}"
            headers = {
            "X-API-Key": "lwNbyh4vwKI8xjWSv6c5GayIk4te84BKhgsbJv1C6Oq0G3pWDGtetzupbUENvdsP"
            }
            requests.request("DELETE", url, headers=headers)
        order.delete()
        return Response({"message": "order has been deleted"}, status=status.HTTP_200_OK)
    

class ProductPictureAddView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes =  [MultiPartParser, FormParser]
    def get(self, request, **kwargs):
        images = ProductPicture.objects.filter(product=kwargs['product'])
        serializer = ProductPictureSerializer(images, many=True)
        print(images[0].product.seller)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, **kwargs):
        product_id = kwargs['product']
        images = request.data
        images = dict(images)['picture[]']
        # for img in images:
        #     print(img)
        try:
            product = ProductInfo.objects.get(id=product_id)
            # ProductPicture.objects.create(product=product, picture=images)
            bulk_list = []
            for img in images:
                bulk_list.append(ProductPicture(product=product, picture=img))
            ProductPicture.objects.bulk_create(bulk_list)
            return Response({'product': product_id}, status=status.HTTP_201_CREATED)
        except ProductInfo.DoesNotExist:
            return Response({'message': 'data not valid'}, status=status.HTTP_400_BAD_REQUEST)


class ProductPictureEditDelete(generics.RetrieveUpdateDestroyAPIView):
    parser_classes =  [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated, IsPictureSeller]
    queryset = ProductPicture.objects.all()
    serializer_class = ProductPictureSerializer
        

from django.db.models import Prefetch
class CheckOutByAddressView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        address = request.data['address']
        products = request.data['products']
        carts = request.data['carts']
        data_address = Address.objects.filter(id__in=address).prefetch_related(
            Prefetch('product', queryset=ProductInfo.objects.filter(id__in=products).prefetch_related(
                Prefetch('cart', queryset=Cart.objects.filter(id__in=carts)))))
        serializer = CheckoutByAddressSerializer(data_address, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class AddComplainView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes =  [MultiPartParser, FormParser]
    def post(self, request):
        try:
            order = Order.objects.get(id=request.data['order_id'])
        except Order.DoesNotExist:
            return Response({'message': 'data order is not valid'}, status=status.HTTP_400_BAD_REQUEST)
        sender = request.user
        text = request.data['text']
        complain = Complain.objects.create(order=order, sender=sender, text=text)
        complain.save()
        if request.data['pictures'] != "":
            images = dict(request.data)['pictures']
            bulk_list = []
            for img in images:
                bulk_list.append(ComplainPicture(complain=complain, picture=img))
            ComplainPicture.objects.bulk_create(bulk_list)
        return Response({'complain_id': complain.pk}, status=status.HTTP_201_CREATED)
    

class ComplainListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, **kwargs):
        order = Order.objects.get(id=kwargs['order'])
        complains = Complain.objects.filter(order=order)
        serializer = ComplainSerializer(complains, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DeleteComplainView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, IsSender]
    queryset = Complain.objects.all()
    serializer_class = ComplainSerializer


# MidTrans
import midtransclient
class PaymentMidtransView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        param = request.data
        snap = midtransclient.Snap(
            # Set to true if you want Production Environment (accept real transaction).
            is_production=False,
            server_key='SB-Mid-server-SoveLcXW2WlLM2WhjXqHhGBH'
        )
        transaction = snap.create_transaction(param)
        # transaction_token = transaction['token']
        return Response(transaction, status=status.HTTP_200_OK)