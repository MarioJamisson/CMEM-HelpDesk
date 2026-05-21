from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Sector, Ticket, TicketMessage, TicketLog

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser']


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'first_name', 'last_name']
        extra_kwargs = {
            'email': {'required': True, 'allow_blank': False}
        }

    def validate_email(self, value):
        # Normalizar para minúsculo
        value = value.lower()
        if User.objects.filter(email__iexact=value).exists() or User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Este e-mail já está cadastrado.")
        return value

    def create(self, validated_data):
        email = validated_data['email'].lower()
        user = User.objects.create_user(
            username=email, # Usa email como username principal
            email=email,
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class SectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = '__all__'

class TicketSerializer(serializers.ModelSerializer):
    criado_por_detalhes = UserSerializer(source='criado_por', read_only=True)
    setor_nome = serializers.CharField(source='setor.nome', read_only=True)

    class Meta:
        model = Ticket
        fields = '__all__'

class TicketMessageSerializer(serializers.ModelSerializer):
    autor_detalhes = UserSerializer(source='autor', read_only=True)

    class Meta:
        model = TicketMessage
        fields = '__all__'

class TicketLogSerializer(serializers.ModelSerializer):
    usuario_detalhes = UserSerializer(source='usuario', read_only=True)

    class Meta:
        model = TicketLog
        fields = '__all__'
