from django.conf.urls import patterns, include, url
from tastypie.api import Api
from tracker.api import ItemResource, UserResource
from django.contrib import admin


v1_api = Api(api_name='v1')
v1_api.register(UserResource())
v1_api.register(ItemResource())

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^api/', include(v1_api.urls)),
    url(r'^admin/', include(admin.site.urls)),
)
