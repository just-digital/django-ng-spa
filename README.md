# AngularJS Single Page Application (SPA) with Django Backend (TastyPie) #

This is an example of a Single Page Application using Django models over a RESTful
interface. It's a lean solution that could be used as a starting point for larger
applications.

It includes authentication as well as an example of restricting the model data to
the "owners" only.

## Getting Started ##

    $ git clone https://github.com/just-digital/django-ng-spa.git
    $ cd django-ng-spa
    $ mkvirtualenv django-ng-spa 
    $ pip install -r requirements.txt
    $ ./reset
    $ python manage.py runserver

## Testing the API ##

    # Authenticate
    $ curl -H "Content-Type: application/json" -X POST --data '{"username": "kevins", "password": "test"}' http://localhost:8000/api/v1/user/authenticate/
    # Register
    $ curl -H "Content-Type: application/json" -X POST --data '{"username": "kevins2", "first_name": "Kevin2", "last_name": "Sparks2", "password":"test2", "email": "kevin2@just-digital.net"}' http://localhost:8000/api/v1/user/register/
    # Profile save
    $ curl -H "Content-Type: application/json" -H "Authorization: ApiKey kevins:mysuperstrongkey" -X PUT  --data '{"username": "kevins", "first_name": "Kevin", "last_name": "Sparks"}' http://localhost:8000/api/v1/user/1/
    # Item list
    $ curl -H "Content-Type: application/json" -H "Authorization: ApiKey kevins:mysuperstrongkey" -X GET http://localhost:8000/api/v1/item/
    # Item get
    $ curl -H "Content-Type: application/json" -H "Authorization: ApiKey kevins:mysuperstrongkey" -X GET http://localhost:8000/api/v1/item/1/
    # Creating a new Item (POST)
    $ curl -H "Content-Type: application/json" -H "Authorization: ApiKey kevins:mysuperstrongkey" -X POST --data '{"title": "my new job", "date": "04-Jan-2014", "duration": 10}' http://localhost:8000/api/v1/item/


