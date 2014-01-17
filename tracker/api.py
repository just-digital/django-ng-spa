from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.conf.urls import url
from tastypie import http, fields
from tastypie.resources import ModelResource
from tastypie.authentication import ApiKeyAuthentication
from tastypie.authorization import Authorization
from tastypie.exceptions import ImmediateHttpResponse
from tastypie.utils import trailing_slash
from tracker.models import Item


class BaseResource(ModelResource):
    """Provides some common defaults"""

    def determine_format(self, request):
        return 'application/json'


# Tasypie authenticate code inspired by:
# http://stackoverflow.com/questions/11770501/how-can-i-login-to-django-using-tastypie
class UserResource(BaseResource):

    class Meta:
        queryset = User.objects.all()
        fields = ['first_name', 'last_name', 'username']
        list_allowed_methods = [] # Disallow all batch requests
        detail_allowed_methods = ['get', 'put', 'post']
        resource_name = 'user'
        authorization= Authorization()

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/authenticate%s$" %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('authenticate'), name="api_login"),
            url(r"^(?P<resource_name>%s)/register%s$" %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('register'), name="api_register"),
        ]

    def authenticate(self, request, **kwargs):
        self.method_check(request, allowed=['post'])
        data = self.deserialize(request, request.body,
                                format=request.META.get('CONTENT_TYPE', 'application/json'))
        username = data.get('username', '')
        password = data.get('password', '')
        # Test if the user credentials will authenticate
        user = authenticate(username=username, password=password)
        if user:
            if user.is_active:
                # Hooray, the user authenticates and is valid. Response
                # with Api Key and some other useful fields
                return self.create_response(request, {
                    'success': True,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'api_key': user.api_key.key,
                    'hours': user.profile.hours,
                })
            else:
                return self.create_response(request, {
                    'success': False,
                    'reason': 'Your account has been disabled',
                    }, http.HttpForbidden)
        else:
            return self.create_response(request, {
                'success': False,
                'reason': 'Username or password is incorrect',
                }, http.HttpUnauthorized)


    @staticmethod
    def _username_exists(username):
        """ Quickly test if a username already exists """
        try:
            user = User.objects.get(username=username)
            return True
        except User.DoesNotExist:
            return False

    def register(self, request, **kwargs):
        """ Creat a user object and return an API Key """
        self.method_check(request, allowed=['post'])
        data = self.deserialize(request, request.body,
                                format=request.META.get('CONTENT_TYPE', 'application/json'))

        valid = True
        message = ""
        if len(data.get('username', '')) == 0:
            valid = False
            message = "A username is required"
        elif self._username_exists(data.get('username', '')):
            valid = False
            message = "That username has already been taken"
        elif len(data.get('password', '')) == 0:
            valid = False
            message = "A password is required"

        if valid:
            # Passed the basic validation, not try create the user, which might
            # raise further validation issues.
            try:
                user = User.objects.create_user(data.get('username'), data.get('email'),
                                                data.get('password'))
                user.first_name = data.get('first_name', "")
                user.last_name = data.get('last_name', "")
                user.save()
            except Exception as e:
                # Model entity validation
                return self.create_response(request, {
                    'success': False,
                    'reason': e,
                    }, http.HttpBadRequest)
        else:
            return self.create_response(request, {
                'success': False,
                'reason': message,
                }, http.HttpBadRequest)

        return self.authenticate(request, **kwargs)


class ItemResource(BaseResource):
    """ Expose the Item entities over REST, and provide a level of authorisation """
    undertime = fields.BooleanField(attribute='undertime', readonly=True)

    def obj_create(self, bundle, **kwargs):
        """ Any "create" methods must use the session user always """
        return super(ItemResource, self).obj_create(bundle, user=bundle.request.user)

    def authorized_read_list(self, object_list, bundle):
        """ All "list" methods must filter by this user only """
        return object_list.filter(user=bundle.request.user)

    def alter_list_data_to_serialize(self, request, data):
        """ Add total time to meta response """
        total_time = 0;
        for obj in data['objects']:
            total_time += obj.obj.duration
        data['meta']['total_time'] =  total_time
        return data

    class Meta:
        list_allowed_methods = ["get", "post"]
        detail_allowed_methods = ['get', 'put', 'delete']
        queryset = Item.objects.all()
        resource_name = 'item'
        authorization= Authorization()
        authentication = ApiKeyAuthentication()
        filtering = {'date': ['range']}

