# This repository is ecommerce using Django as backend and React as frontend.
# This application use Json Web Token for authentication system.

### Follow the instruction bellow to run this application in your local computer
download or clone repository

open the folder in your conde editor

Start from backend. Create virtual env inside of backend directory. In the terminal, ensure you are in backend directory. run this command "virtualenv env". If you have not install virtualenv in your computer, run this command before you create virtual env "pip install virtual env"

Activate the env. In the terminal, run this command "env/Scripts/activate"

Install all package for backend. In the terminal, ensure you are in backend directory run this command "pip install -r requirements.txt"

Create ".env" file inside the backend directory

Copy the content of ".env-example" and paste it in ".env"

You need to get SECRET_KEY, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD. for getting EMAIL_HOST_USER and EMAIL_HOST_PASSWORD, wacth my video https://www.youtube.com/watch?v=2pBzVtevmJI

For getting SECRET_KEY, create secret_key.py inside backend directory and put this code inside the secret_key.py

from django.core.management.utils import get_random_secret_key

print(get_random_secret_key())

Run this command in the terminal "python secret_key.py"

You will get new secret key in the terminal. Copy that and paste it in secret key. Dont use brackets, for example SECRET_KEY="the_secret_key"

Add "django-insecure-" in the front the_secret_key for example SECRET_KEY="django-insecure-the_secret_key"

Set DEBUG=True in .env

Run in the terminal "python manage.py makemigrations" and "python manage.py migrate"

Create super user "python manage.py createsuperuser"

Run django server in the terminal "python manage.py runserver"

Open admin site in the browser "http://localhost:8000/admin/

Select add social applications. and create a new one. wacth this video for adding social application https://www.youtube.com/watch?v=A22oOjoH5bQ

For running react in local, create new terminal and move your position in the terminal to frontend directory. run "cd frontend" in your terminal

Install all packages in react. run this command "yarn install"

Open Login.jsx and change clientID with client id that you put in social applications in admin site. (frontend/src/Pages/Login.jsx)

Test the application
