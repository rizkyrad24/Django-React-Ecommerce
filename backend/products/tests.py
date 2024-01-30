from accounts.models import CustomUserModel
from .models import ProductInfo, ProductPicture, Address, CategoryProduct, Cart
from .views import ProductListView
from django.test import TestCase
from rest_framework.test import APIClient
import json
import tempfile

class TestsViews(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.seller = CustomUserModel.objects.create(
            email = "seller@email.com",
            first_name = "seller"
        )
        self.buyer = CustomUserModel.objects.create(
            email = "buyer@email.com",
            first_name = "buyer"
        )
        self.buyer2 = CustomUserModel.objects.create(
            email = "buyer2@email.com",
            first_name = "buyer2"
        )
        self.category1 = CategoryProduct.objects.create(
            category = "Phone",
            slug = "phone"
        )
        self.category2 = CategoryProduct.objects.create(
            category = "Home",
            slug = "home"
        )
        self.address1 = Address.objects.create(
            user = self.seller,
            address_name = "example",
            name = "my shop",
            phone = "0988888898",
            detail_address = "example address",
            area = "example area",
            area_id = 1,
            suburb = "example suburb",
            suburb_id = 1,
            city = "example city",
            city_id = 1,
            state = "example state",
            state_id = 1,
            country = "example country",
            country_id = 1
        )
        self.address2 = Address.objects.create(
            user = self.seller,
            address_name = "example2",
            name = "my shop2",
            phone = "0988888898",
            detail_address = "example address2",
            area = "example area2",
            area_id = 2,
            suburb = "example suburb2",
            suburb_id = 2,
            city = "example city2",
            city_id = 2,
            state = "example state2",
            state_id = 2,
            country = "example country2",
            country_id = 2
        )
        self.product = ProductInfo.objects.create(
            title = "product1",
            category = self.category1,
            seller = self.seller,
            description = "description product1",
            width = 5,
            height = 5,
            length = 5,
            weight = 5,
            price = 200,
            stock = 100,
            sold = 10,
            address = self.address1,
            slug = "product1"
        )
        self.product2 = ProductInfo.objects.create(
            title = "product2",
            category = self.category2,
            seller = self.seller,
            description = "description product2",
            width = 5,
            height = 5,
            length = 5,
            weight = 5,
            price = 200,
            stock = 100,
            sold = 10,
            address = self.address2,
            slug = "product2"
        )
        self.product3 = ProductInfo.objects.create(
            title = "product3",
            category = self.category1,
            seller = self.seller,
            description = "description product3",
            width = 5,
            height = 5,
            length = 5,
            weight = 5,
            price = 200,
            stock = 100,
            sold = 10,
            address = self.address2,
            slug = "product3"
        )
        self.product_picture1 = ProductPicture.objects.create(
            product = self.product,
            picture = tempfile.NamedTemporaryFile(suffix=".jpg").name
        )
        self.product_picture2 = ProductPicture.objects.create(
            product = self.product,
            picture = tempfile.NamedTemporaryFile(suffix=".jpg").name
        )
        self.cart1 = Cart.objects.create(
            user = self.buyer,
            product = self.product,
            amount = 2
        )
        self.cart2 = Cart.objects.create(
            user = self.buyer,
            product = self.product2,
            amount = 1
        )
    
    # path /product/list/
    def test_list_product2(self):
        response = self.client.get("/product/list/")
        self.assertEquals(response.status_code, 200)
        self.assertEquals(json.loads(response.content)['count'], 3)

    # path /product/list//product/list/category/<str:slug>/
    def test_list_per_category_product(self):
        response = self.client.get(f"/product/list/category/{self.category1.slug}/")
        for item in json.loads(response.content)['results']:
            self.assertEquals(item['category'],self.category1.pk )
        self.assertEquals(response.status_code, 200)

    # path /product/list/search/
    def test_list_search_product(self):
        response = self.client.get(f"/product/list/search/?keyword=product1")
        for item in json.loads(response.content)['results']:
            self.assertEquals(item['title'], 'product1')
        self.assertEquals(response.status_code, 200)

    # path /product/detail/<str:slug>/
    def test_product_detail(self):
        response = self.client.get(f"/product/detail/{self.product.slug}/")
        self.assertEquals(json.loads(response.content)['title'], 'product1')
        self.assertEquals(json.loads(response.content)['description'], 'description product1')
        self.assertEquals(response.status_code, 200)

    # path /product/mylist/
    def test_myproduct_list(self):
        self.client.force_authenticate(user=self.seller) # pyright: ignore[reportGeneralTypeIssues]
        response = self.client.get("/product/mylist/")
        for item in json.loads(response.content)['results']:
            self.assertEquals(item['seller'], self.seller.pk)
        self.assertEquals(response.status_code, 200)

    def test_myproduct_create_authenticated(self):
        self.client.force_authenticate(user=self.seller) # pyright: ignore[reportGeneralTypeIssues]
        data = {
            'title' : "new product",
            'category' : self.category1.pk,
            'seller' : self.seller.pk,
            'description' : "description new product",
            'width' : 10,
            'height' : 10,
            'length' : 10,
            'weight' : 10,
            'price' : 1000,
            'stock' : 50,
            'sold' : 20,
            'address' : self.address1.pk,
            'slug' : "new-product"
        }
        response = self.client.post("/product/mylist/", data=data, format='json')
        new_product = ProductInfo.objects.get(slug='new-product')
        self.assertEquals(response.status_code, 201)
        self.assertEquals(new_product.title, "new product")
        self.assertEquals(new_product.description, "description new product")

    def test_myproduct_create_not_authenticated(self):
        data = {
            'title' : "new product",
            'category' : self.category1.pk,
            'seller' : self.seller.pk,
            'description' : "description new product",
            'width' : 10,
            'height' : 10,
            'length' : 10,
            'weight' : 10,
            'price' : 1000,
            'stock' : 50,
            'sold' : 20,
            'address' : self.address1.pk,
            'slug' : "new-product"
        }
        response = self.client.post("/product/mylist/", data=data, format='json')
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)

    # path /product/mylist/action/<int:pk>/
    def test_myproduct_true_seller_edit(self):
        self.client.force_authenticate(user=self.seller) # pyright: ignore[reportGeneralTypeIssues]
        data = {
            'title' : "edit product",
            'category' : self.category1.pk,
            'seller' : self.seller.pk,
            'description' : "description edit product",
            'width' : 10,
            'height' : 10,
            'length' : 10,
            'weight' : 10,
            'price' : 1000,
            'stock' : 50,
            'sold' : 20,
            'address' : self.address1.pk,
            'slug' : "edit-product"
        }
        response = self.client.put(f"/product/mylist/action/{self.product3.pk}/", data=data, format='json')
        edit_product = ProductInfo.objects.get(id=self.product3.pk)
        self.assertEquals(response.status_code, 200)
        self.assertEquals(edit_product.title, "edit product")
        self.assertEquals(edit_product.description, "description edit product")

    def test_myproduct_false_seller_edit(self):
        self.client.force_authenticate(user=self.buyer) # pyright: ignore[reportGeneralTypeIssues]
        data = {
            'title' : "edit product",
            'category' : self.category1.pk,
            'seller' : self.seller.pk,
            'description' : "description edit product",
            'width' : 10,
            'height' : 10,
            'length' : 10,
            'weight' : 10,
            'price' : 1000,
            'stock' : 50,
            'sold' : 20,
            'address' : self.address1.pk,
            'slug' : "edit-product"
        }
        response = self.client.put(f"/product/mylist/action/{self.product3.pk}/", data=data, format='json')
        self.assertEquals(json.loads(response.content)['detail'], "You do not have permission to perform this action.")
        self.assertEquals(response.status_code, 403)

    def test_myproduct_not_authenticated_seller_edit(self):
        data = {
            'title' : "edit product",
            'category' : self.category1.pk,
            'seller' : self.seller.pk,
            'description' : "description edit product",
            'width' : 10,
            'height' : 10,
            'length' : 10,
            'weight' : 10,
            'price' : 1000,
            'stock' : 50,
            'sold' : 20,
            'address' : self.address1.pk,
            'slug' : "edit-product"
        }
        response = self.client.put(f"/product/mylist/action/{self.product3.pk}/", data=data, format='json')
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)

    def test_myproduct_true_seller_delete(self):
        self.client.force_authenticate(user=self.seller) # pyright: ignore[reportGeneralTypeIssues]
        response = self.client.delete(f"/product/mylist/action/{self.product3.pk}/")
        self.assertEquals(response.status_code, 204)
        self.assertEquals(self.seller.product_info.count(), 2) # pyright: ignore[reportGeneralTypeIssues]

    def test_myproduct_false_seller_delete(self):
        self.client.force_authenticate(user=self.buyer) # pyright: ignore[reportGeneralTypeIssues]
        response = self.client.delete(f"/product/mylist/action/{self.product3.pk}/")
        self.assertEquals(json.loads(response.content)['detail'], "You do not have permission to perform this action.")
        self.assertEquals(response.status_code, 403)
        self.assertEquals(self.seller.product_info.count(), 3) # pyright: ignore[reportGeneralTypeIssues]

    def test_myproduct_not_authenticated_seller_delete(self):
        response = self.client.delete(f"/product/mylist/action/{self.product3.pk}/")
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)
        self.assertEquals(self.seller.product_info.count(), 3) # pyright: ignore[reportGeneralTypeIssues]

    # path /product/picture/<int:pk>/
    def test_product_image_list_authenticated(self):
        self.client.force_authenticate(user=self.seller) # pyright: ignore[reportGeneralTypeIssues]
        response = self.client.get(f"/product/picture/{self.product.pk}/")
        self.assertEquals(response.status_code, 200)
        self.assertEquals(len(json.loads(response.content)), 2)

    def test_product_image_list_not_authenticated(self):
        response = self.client.get(f"/product/picture/{self.product.pk}/")
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)

    def test_product_image_create_authenticated(self):
        self.client.force_authenticate(user=self.seller) # pyright: ignore[reportGeneralTypeIssues]
        data = {'picture[]': [tempfile.NamedTemporaryFile(suffix=".jpg").name, tempfile.NamedTemporaryFile(suffix=".jpg").name]}
        response = self.client.post(f"/product/picture/{self.product.pk}/", data=data)
        self.assertEquals(response.status_code, 201)
        self.assertEquals(self.product.mypicture.count(), 4) # pyright: ignore[reportGeneralTypeIssues]

    def test_product_image_create_not_authenticated(self):
        data = {'picture[]': [tempfile.NamedTemporaryFile(suffix=".jpg").name, tempfile.NamedTemporaryFile(suffix=".jpg").name]}
        response = self.client.post(f"/product/picture/{self.product.pk}/", data=data)
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)
        self.assertEquals(self.product.mypicture.count(), 2) # pyright: ignore[reportGeneralTypeIssues]

    # path /product/picture/action/<int:pk>/
    def test_product_image_edit_authenticated(self):
        self.client.force_authenticate(user=self.seller) # pyright: ignore[reportGeneralTypeIssues]
        data = {
            'picture': tempfile.NamedTemporaryFile(suffix=".jpg").name
        }
        response = self.client.put(f"/product/picture/action/{self.product_picture1.pk}/", data=data)
        self.assertEquals(response.status_code, 200)
        self.assertEquals(json.loads(response.content)['detail'], "Pictute was edited.")
        self.assertEquals(self.product.mypicture.count(), 2) # pyright: ignore[reportGeneralTypeIssues]

    def test_product_image_edit_authenticated_false_seller(self):
        self.client.force_authenticate(user=self.buyer) # pyright: ignore[reportGeneralTypeIssues]
        data = {
            'picture': tempfile.NamedTemporaryFile(suffix=".jpg").name
        }
        response = self.client.put(f"/product/picture/action/{self.product_picture1.pk}/", data=data)
        self.assertEquals(json.loads(response.content)['detail'], "You do not have permission to perform this action.")
        self.assertEquals(response.status_code, 403)
        
    def test_product_image_edit_authenticated_false_picture_id(self):
        self.client.force_authenticate(user=self.seller) # pyright: ignore[reportGeneralTypeIssues]
        data = {
            'picture': tempfile.NamedTemporaryFile(suffix=".jpg").name
        }
        response = self.client.put(f"/product/picture/action/100/", data=data)
        self.assertEquals(response.status_code, 404)
        self.assertEquals(json.loads(response.content)['detail'], "Picture Id is not found.")

    def test_product_image_edit_not_authenticated(self):
        data = {
            'picture': tempfile.NamedTemporaryFile(suffix=".jpg").name
        }
        response = self.client.put(f"/product/picture/action/{self.product_picture1.pk}/", data=data)
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)

    def test_product_image_delete_authenticated(self):
        self.client.force_authenticate(user=self.seller) # pyright: ignore[reportGeneralTypeIssues]
        response = self.client.delete(f"/product/picture/action/{self.product_picture1.pk}/")
        self.assertEquals(response.status_code, 200)
        self.assertEquals(json.loads(response.content)['detail'], "Pictute was deleted.")
        self.assertEquals(self.product.mypicture.count(), 1) # pyright: ignore[reportGeneralTypeIssues]

    def test_product_image_delete_authenticated_false_seller(self):
        self.client.force_authenticate(user=self.buyer) # pyright: ignore[reportGeneralTypeIssues]
        response = self.client.delete(f"/product/picture/action/{self.product_picture1.pk}/")
        self.assertEquals(json.loads(response.content)['detail'], "You do not have permission to perform this action.")
        self.assertEquals(response.status_code, 403)
        
    def test_product_image_delete_authenticated_false_picture_id(self):
        self.client.force_authenticate(user=self.seller) # pyright: ignore[reportGeneralTypeIssues]
        response = self.client.delete(f"/product/picture/action/100/")
        self.assertEquals(response.status_code, 404)
        self.assertEquals(json.loads(response.content)['detail'], "Picture Id is not found.")

    def test_product_image_delete_not_authenticated(self):
        response = self.client.delete(f"/product/picture/action/{self.product_picture1.pk}/")
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)

    # path /product/category/
    def test_category_list(self):
        response = self.client.get("/product/category/")
        self.assertEquals(response.status_code, 200)
        self.assertEquals(json.loads(response.content)['count'], 2)

    # path /product/shipping/address/
    def test_address_list_authenticated(self):
        self.client.force_authenticate(user=self.seller) # pyright: ignore[reportGeneralTypeIssues]
        response = self.client.get("/product/shipping/address/")
        self.assertEquals(response.status_code, 200)
        self.assertEquals(json.loads(response.content)['count'], 2)

    def test_address_list_not_authenticated(self):
        response = self.client.get("/product/shipping/address/")
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)

    def test_add_address_list_authenticated(self):
        self.client.force_authenticate(user=self.seller) # pyright: ignore[reportGeneralTypeIssues]
        data = {
            'user': self.seller.pk,
            'address_name': "new example",
            'name': "my shop",
            'phone': "0988888898",
            'detail_address': "example address",
            'area': "example area",
            'area_id': 2,
            'suburb': "example suburb",
            'suburb_id': 2,
            'city': "example city",
            'city_id': 2,
            'state': "example state",
            'state_id': 2,
            'country': "example country",
            'country_id': 2
        }
        response = self.client.post("/product/shipping/address/", data=data, format='json')
        self.assertEquals(response.status_code, 201)
        self.assertEquals(self.seller.address.count(), 3) # pyright: ignore[reportGeneralTypeIssues]

    def test_add_address_list_not_authenticated(self):
        data = {
            'user': self.seller.pk,
            'address_name': "new example",
            'name': "my shop",
            'phone': "0988888898",
            'detail_address': "example address",
            'area': "example area",
            'area_id': 2,
            'suburb': "example suburb",
            'suburb_id': 2,
            'city': "example city",
            'city_id': 2,
            'state': "example state",
            'state_id': 2,
            'country': "example country",
            'country_id': 2
        }
        response = self.client.post("/product/shipping/address/", data=data, format='json')
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)

    # path /product/shipping/address/action/<int:pk>/
    def test_address_detail_get_authenticated(self):
        self.client.force_authenticate(user=self.seller) # pyright: ignore[reportGeneralTypeIssues]
        response = self.client.get(f"/product/shipping/address/action/{self.address1.pk}/")
        self.assertEquals(response.status_code, 200)
        self.assertEquals(json.loads(response.content)['address_name'], "example")

    def test_address_detail_get_not_authenticated(self):
        response = self.client.get(f"/product/shipping/address/action/{self.address1.pk}/")
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)

    def test_address_detail_put_authenticated(self):
        self.client.force_authenticate(user=self.seller) # pyright: ignore[reportGeneralTypeIssues]
        data = {
            'user': self.seller.pk,
            'address_name': "example edited",
            'name': "my shop",
            'phone': "0988888898",
            'detail_address': "example address",
            'area': "example area",
            'area_id': 2,
            'suburb': "example suburb",
            'suburb_id': 2,
            'city': "example city",
            'city_id': 2,
            'state': "example state",
            'state_id': 2,
            'country': "example country",
            'country_id': 2
        }
        response = self.client.put(f"/product/shipping/address/action/{self.address1.pk}/", data=data, format='json')
        address_edited = Address.objects.get(id=self.address1.pk)
        self.assertEquals(response.status_code, 200)
        self.assertEquals(address_edited.address_name, "example edited")

    def test_address_detail_put_authenticated_false_user(self):
        self.client.force_authenticate(user=self.buyer) # pyright: ignore[reportGeneralTypeIssues]
        data = {
            'user': self.seller.pk,
            'address_name': "example edited",
            'name': "my shop",
            'phone': "0988888898",
            'detail_address': "example address",
            'area': "example area",
            'area_id': 2,
            'suburb': "example suburb",
            'suburb_id': 2,
            'city': "example city",
            'city_id': 2,
            'state': "example state",
            'state_id': 2,
            'country': "example country",
            'country_id': 2
        }
        response = self.client.put(f"/product/shipping/address/action/{self.address1.pk}/", data=data, format='json')
        self.assertEquals(json.loads(response.content)['detail'], "You do not have permission to perform this action.")
        self.assertEquals(response.status_code, 403)

    def test_address_detail_put_not_authenticated(self):
        data = {
            'user': self.seller.pk,
            'address_name': "example edited",
            'name': "my shop",
            'phone': "0988888898",
            'detail_address': "example address",
            'area': "example area",
            'area_id': 2,
            'suburb': "example suburb",
            'suburb_id': 2,
            'city': "example city",
            'city_id': 2,
            'state': "example state",
            'state_id': 2,
            'country': "example country",
            'country_id': 2
        }
        response = self.client.put(f"/product/shipping/address/action/{self.address1.pk}/", data=data, format='json')
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)

    def test_address_detail_delete_authenticated(self):
        self.client.force_authenticate(user=self.seller) # pyright: ignore[reportGeneralTypeIssues]
        response = self.client.delete(f"/product/shipping/address/action/{self.address1.pk}/")
        self.assertEquals(response.status_code, 204)
        self.assertEquals(self.seller.address.count(), 1) # pyright: ignore[reportGeneralTypeIssues]

    def test_address_detail_delete_authenticated_false_user(self):
        self.client.force_authenticate(user=self.buyer) # pyright: ignore[reportGeneralTypeIssues]
        response = self.client.delete(f"/product/shipping/address/action/{self.address1.pk}/")
        self.assertEquals(json.loads(response.content)['detail'], "You do not have permission to perform this action.")
        self.assertEquals(response.status_code, 403)

    def test_address_detail_delete_not_authenticated(self):
        response = self.client.delete(f"/product/shipping/address/action/{self.address1.pk}/")
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)

    # path /product/cart/<int:pk>/
    def test_cart_list_authenticated(self):
        self.client.force_authenticate(user=self.buyer) # pyright: ignore[reportGeneralTypeIssues]
        response = self.client.get(f"/product/cart/{self.buyer.pk}/")
        self.assertEquals(response.status_code, 200)
        self.assertEquals(len(json.loads(response.content)), 2)

    def test_cart_list_not_authenticated(self):
        response = self.client.get(f"/product/cart/{self.buyer.pk}/")
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)

    # path /product/add/cart/
    def test_add_cart_authenticated(self):
        self.client.force_authenticate(user=self.buyer) # pyright: ignore[reportGeneralTypeIssues]
        data = {
            'user': self.buyer.pk,
            'product': self.product2.pk,
            'amount': 2
        }
        response = self.client.post("/product/add/cart/", data=data, format='json')
        self.assertEquals(response.status_code, 201)
        self.assertEquals(self.buyer.cart.count(), 3) # pyright: ignore[reportGeneralTypeIssues]

    def test_add_cart_not_authenticated(self):
        data = {
            'user': self.buyer.pk,
            'product': self.product2.pk,
            'amount': 2
        }
        response = self.client.post("/product/add/cart/", data=data, format='json')
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)

    # path /product/cart/action/<int:pk>/
    def test_get_cart_authenticated(self):
        self.client.force_authenticate(user=self.buyer) # pyright: ignore[reportGeneralTypeIssues]
        response = self.client.get(f"/product/cart/action/{self.cart1.pk}/")
        self.assertEquals(response.status_code, 200)
        self.assertEquals(json.loads(response.content)['product'], self.product.pk)

    def test_get_cart_authenticated_false_user(self):
        self.client.force_authenticate(user=self.buyer2) # pyright: ignore[reportGeneralTypeIssues]
        response = self.client.get(f"/product/cart/action/{self.cart1.pk}/")
        self.assertEquals(json.loads(response.content)['detail'], "You do not have permission to perform this action.")
        self.assertEquals(response.status_code, 403)

    def test_get_cart_not_authenticated(self):
        response = self.client.get(f"/product/cart/action/{self.cart1.pk}/")
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)

    def test_edit_cart_authenticated(self):
        self.client.force_authenticate(user=self.buyer) # pyright: ignore[reportGeneralTypeIssues]
        data = {
            'user': self.cart1.user.pk,
            'product': self.cart1.product.pk,
            'amount': 4
        }
        response = self.client.put(f"/product/cart/action/{self.cart1.pk}/", data=data, format='json')
        cart_edited = Cart.objects.get(id=self.cart1.pk)
        self.assertEquals(response.status_code, 200)
        self.assertEquals(cart_edited.amount, 4)

    def test_edit_cart_authenticated_false_user(self):
        self.client.force_authenticate(user=self.buyer2) # pyright: ignore[reportGeneralTypeIssues]
        data = {
            'user': self.cart1.user.pk,
            'product': self.cart1.product.pk,
            'amount': 4
        }
        response = self.client.put(f"/product/cart/action/{self.cart1.pk}/", data=data, format='json')
        self.assertEquals(json.loads(response.content)['detail'], "You do not have permission to perform this action.")
        self.assertEquals(response.status_code, 403)

    def test_edit_cart_not_authenticated(self):
        data = {
            'user': self.cart1.user.pk,
            'product': self.cart1.product.pk,
            'amount': 4
        }
        response = self.client.put(f"/product/cart/action/{self.cart1.pk}/", data=data, format='json')
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)
    
    def test_delete_cart_authenticated(self):
        self.client.force_authenticate(user=self.buyer) # pyright: ignore[reportGeneralTypeIssues]
        response = self.client.delete(f"/product/cart/action/{self.cart1.pk}/")
        self.assertEquals(response.status_code, 204)
        self.assertEquals(self.buyer.cart.count(), 1) # pyright: ignore[reportGeneralTypeIssues]

    def test_delete_cart_authenticated_false_user(self):
        self.client.force_authenticate(user=self.buyer2) # pyright: ignore[reportGeneralTypeIssues]
        response = self.client.delete(f"/product/cart/action/{self.cart1.pk}/")
        self.assertEquals(json.loads(response.content)['detail'], "You do not have permission to perform this action.")
        self.assertEquals(response.status_code, 403)

    def test_delete_cart_not_authenticated(self):
        response = self.client.delete(f"/product/cart/action/{self.cart1.pk}/")
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)

    # path /product/cart/action/multiple-delete/
    def test_multiple_delete_authenticated(self):
        self.client.force_authenticate(user=self.buyer) # pyright: ignore[reportGeneralTypeIssues]
        data = {"data":[self.cart1.pk, self.cart2.pk]}
        response = self.client.post(f"/product/cart/action/multiple-delete/", data=data, format='json')
        self.assertEquals(response.status_code, 202)
        self.assertEquals(self.buyer.cart.count(), 0) # pyright: ignore[reportGeneralTypeIssues]
        self.assertEquals(json.loads(response.content)['detail'], "Carts have been deleted")

    def test_multiple_delete_authenticated_false_user(self):
        self.client.force_authenticate(user=self.buyer2) # pyright: ignore[reportGeneralTypeIssues]
        data = {"data":[self.cart1.pk, self.cart2.pk]}
        response = self.client.post(f"/product/cart/action/multiple-delete/", data=data, format='json')
        self.assertEquals(response.status_code, 406)
        self.assertEquals(json.loads(response.content)['detail'], "You cannot delete carts of other user")

    def test_multiple_delete_authenticated_wrong_input(self):
        self.client.force_authenticate(user=self.buyer) # pyright: ignore[reportGeneralTypeIssues]
        data = {"data":[7, 8]}
        response = self.client.post(f"/product/cart/action/multiple-delete/", data=data, format='json')
        self.assertEquals(response.status_code, 404)
        self.assertEquals(json.loads(response.content)['detail'], "Carts not found")

    def test_multiple_delete_not_authenticated(self):
        data = {"data":[self.cart1.pk, self.cart2.pk]}
        response = self.client.post(f"/product/cart/action/multiple-delete/", data=data, format='json')
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)

    # path /product/cart/action/set-bought/
    def test_cart_change_to_bought_authenticated(self):
        self.client.force_authenticate(user=self.buyer) # pyright: ignore[reportGeneralTypeIssues]
        data = {"data":[self.cart1.pk, self.cart2.pk]}
        response = self.client.post(f"/product/cart/action/set-bought/", data=data, format='json')
        cart1 = Cart.objects.get(id=self.cart1.pk)
        cart2 = Cart.objects.get(id=self.cart2.pk)
        self.assertTrue(cart1.is_bought)
        self.assertTrue(cart2.is_bought)
        self.assertEquals(json.loads(response.content)['detail'], "Carts have been bought")
        self.assertEquals(response.status_code, 202)

    def test_cart_change_to_bought_authenticated_false_user(self):
        self.client.force_authenticate(user=self.buyer2) # pyright: ignore[reportGeneralTypeIssues]
        data = {"data":[self.cart1.pk, self.cart2.pk]}
        response = self.client.post(f"/product/cart/action/set-bought/", data=data, format='json')
        self.assertEquals(json.loads(response.content)['detail'], "You cannot change carts of other user")
        self.assertEquals(response.status_code, 406)

    def test_cart_change_to_bought_not_authenticated(self):
        data = {"data":[self.cart1.pk, self.cart2.pk]}
        response = self.client.post(f"/product/cart/action/set-bought/", data=data, format='json')
        self.assertEquals(json.loads(response.content)['detail'], "Authentication credentials were not provided.")
        self.assertEquals(response.status_code, 401)

    # third party shipper
    # path /product/address/country/
    def test_get_country_authenticated(self):
        self.client.force_authenticate(user=self.buyer) # pyright: ignore[reportGeneralTypeIssues]
        response = self.client.get("/product/address/country/")
        self.assertEquals(response.status_code, 200)