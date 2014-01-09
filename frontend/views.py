from django.shortcuts import render_to_response
from django.template import RequestContext


def index(request):
    """ This application only has one view because it's an AJAX app """
    return render_to_response('index.html', {},
                              context_instance=RequestContext(request))

