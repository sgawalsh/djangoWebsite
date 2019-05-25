from django.conf.urls import url
from . import views

urlpatterns = [
        url(r'^$', views.index, name = 'index'),
		url(r'^takeTurn$', views.takeTurn, name = 'takeTurn'),
		url(r'^backendAutoplay$', views.backendAutoplay, name = 'backendAutoplay')
]
