from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Sector, Ticket, TicketMessage, TicketLog
from .serializers import (
    SectorSerializer, TicketSerializer, TicketMessageSerializer, 
    TicketLogSerializer, UserSerializer, UserRegisterSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and (user.is_staff or user.is_superuser):
            return User.objects.all()
        if user.is_authenticated:
            return User.objects.filter(id=user.id)
        return User.objects.none()

    def get_permissions(self):
        if self.action in ['destroy', 'create', 'update', 'partial_update']:
            return [permissions.IsAdminUser()]
        if self.action == 'register':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ['create', 'register']:
            return UserRegisterSerializer
        return UserSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SectorViewSet(viewsets.ModelViewSet):
    queryset = Sector.objects.all()
    serializer_class = SectorSerializer

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Ticket.objects.none()
        if user.is_staff or user.is_superuser:
            return Ticket.objects.all().order_by('-data_abertura')
        return Ticket.objects.filter(criado_por=user).order_by('-data_abertura')

    def perform_create(self, serializer):
        ticket = serializer.save(criado_por=self.request.user)
        # Cria log automático de abertura
        TicketLog.objects.create(
            ticket=ticket,
            usuario=self.request.user,
            acao=f"Chamado aberto por {self.request.user.first_name or self.request.user.username}"
        )

    def perform_update(self, serializer):
        old_ticket = self.get_object()
        old_status = old_ticket.status
        old_tecnico = old_ticket.tecnico_responsavel
        
        ticket = serializer.save()
        
        new_status = ticket.status
        new_tecnico = ticket.tecnico_responsavel
        
        changes = []
        if old_status != new_status:
            changes.append(f"status alterado para '{new_status}'")
        if old_tecnico != new_tecnico:
            tec_name = f"{new_tecnico.first_name} {new_tecnico.last_name}" if new_tecnico else "Ninguém"
            changes.append(f"técnico responsável alterado para '{tec_name}'")
            
        if changes:
            acao_str = f"Alteração: {', '.join(changes)} por {self.request.user.first_name or self.request.user.username}"
            TicketLog.objects.create(
                ticket=ticket,
                usuario=self.request.user,
                acao=acao_str
            )

class TicketMessageViewSet(viewsets.ModelViewSet):
    serializer_class = TicketMessageSerializer

    def get_queryset(self):
        queryset = TicketMessage.objects.all().order_by('data_envio')
        ticket_id = self.request.query_params.get('ticket')
        if ticket_id is not None:
            queryset = queryset.filter(ticket_id=ticket_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(autor=self.request.user)


class TicketLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TicketLogSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return TicketLog.objects.none()
        if user.is_staff or user.is_superuser:
            return TicketLog.objects.all().order_by('-data')
        return TicketLog.objects.filter(ticket__criado_por=user).order_by('-data')

