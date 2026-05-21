import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from tickets.models import Sector, Ticket

print("Criando superuser...")
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@cmem.com.br', 'admin123')

print("Criando funcionária de teste...")
if not User.objects.filter(username='maria').exists():
    User.objects.create_user('maria', 'maria@cmem.com.br', 'senha123', first_name='Maria', last_name='Silva')

print("Criando setores...")
setores = ['Técnico']
for s in setores:
    Sector.objects.get_or_create(nome=s)


print("Criando chamados falsos...")
tecnico = Sector.objects.get(nome='Técnico')
admin_user = User.objects.get(username='admin')
maria_user = User.objects.get(username='maria')

Ticket.objects.get_or_create(
    titulo="Computador não liga",
    descricao="Cheguei hoje de manhã e a tela está toda preta, não dá sinal de vida.",
    categoria="Computador",
    prioridade="Alta",
    status="Aberto",
    setor=tecnico,
    criado_por=maria_user
)

Ticket.objects.get_or_create(
    titulo="Impressora com erro de papel",
    descricao="A impressora principal do RH está atolando papel toda hora.",
    categoria="Impressora",
    prioridade="Média",
    status="Em análise",
    setor=tecnico,
    criado_por=maria_user,
    tecnico_responsavel=admin_user
)


print("Seed concluído com sucesso!")
