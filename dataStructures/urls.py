from django.conf.urls import url
from . import views

urlpatterns = [
        url(r'^$', views.index, name = 'index'),
		url(r'^binarySearchTree$', views.bst, name = 'bst'),
		url(r'^heap$', views.heap, name = 'heap'),
]
