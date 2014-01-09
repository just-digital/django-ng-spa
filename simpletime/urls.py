from django.conf.urls import patterns, include, url
from tastypie.api import Api
from tracker.api import ItemResource, UserResource
from django.contrib import admin
from django.conf import settings


v1_api = Api(api_name='v1')
v1_api.register(UserResource())
v1_api.register(ItemResource())

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'frontend.views.index'),
    url(r'^api/', include(v1_api.urls)),
    url(r'^admin/', include(admin.site.urls)),
)


# Static files should always be served by Apache/Nginx/Other
# But for dev, we'll just make is easy and server them ourselves
if settings.DEBUG:
    urlpatterns += patterns('',
        url(r'^static/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.STATIC_ROOT,
        }),
   )
