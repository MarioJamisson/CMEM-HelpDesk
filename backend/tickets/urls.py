from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SectorViewSet, TicketViewSet, TicketMessageViewSet, TicketLogViewSet, UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'sectors', SectorViewSet)
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'messages', TicketMessageViewSet, basename='message')
router.register(r'logs', TicketLogViewSet, basename='log')


urlpatterns = [
    path('', include(router.urls)),
]
