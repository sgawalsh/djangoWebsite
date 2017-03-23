from django.conf.urls import url
from . import views

urlpatterns = [
        url(r'^$', views.index, name = 'index'),
        url(r'^saveCanvas', views.saveCanvasDelOldest, name = 'saveCanvas'),
        url(r'^setOriginal', views.setOriginal, name = 'setOriginal'),
        url(r'^loadCanvas', views.loadCanvas, name = 'loadCanvas'),
        url(r'^createCanvas', views.createOriginal, name = 'createCanvas'),
        url(r'^loadDrawing', views.loadDrawing, name = 'loadDrawing'),
        url(r'^loadList', views.loadList, name = 'loadList'),

]
