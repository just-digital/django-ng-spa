from tastypie import http
from tastypie.resources import ModelResource
from tastypie.authorization import Authorization
from tastypie.exceptions import ImmediateHttpResponse
from tracker.models import Item
from django.contrib.auth.models import User


class BaseResource(ModelResource):
    """Provides some common defaults"""

    def determine_format(self, request):
        return 'application/json'


class UserResource(BaseResource):

    class Meta:
        #authentication = ApiKeyAuthentication
        list_allowed_methods = [] # Disallow all batch requests
        detail_allowed_methods = ['get', 'put', 'delete']
        queryset = User.objects.all()
        fields = ['username', 'first_name', 'last_name']
        resource_name = 'user'
        authorization= Authorization()


class ItemResource(BaseResource):

    def get_object_list(self, request):
        print request
        if request.user.is_authenticated():
            userid = request.user.id
            return super(ItemResource, self).get_object_list(request)\
                                            .filter(user=userid)
        else:
            # Response with a 401 Unauthorised
            raise ImmediateHttpResponse(response=http.HttpUnauthorized())

    class Meta:
        #authentication = ApiKeyAuthentication
        list_allowed_methods = ["get"]  # Don't allow batch deletes etc.
        queryset = Item.objects.all()
        resource_name = 'item'


