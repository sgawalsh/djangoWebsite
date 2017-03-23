from django.conf.urls import url, include
from redditBot.models import subData
from . import views

urlpatterns = [
        url(r'^$', views.index, name = 'index'),
		#url(r'^add$', views.addStuff, name = 'add'),
        ]
