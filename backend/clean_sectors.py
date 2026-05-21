import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from tickets.models import Sector, Ticket

print("Iniciando limpeza de setores...")

# 1. Garante que o setor 'Técnico' exista
tecnico_sector, created = Sector.objects.get_or_create(nome='Técnico')
if created:
    print("Setor 'Técnico' criado.")
else:
    print("Setor 'Técnico' já existia.")

# 2. Atualiza todos os chamados existentes para apontar para o setor 'Técnico'
updated_count = Ticket.objects.all().update(setor=tecnico_sector)
print(f"{updated_count} chamado(s) atualizado(s) para o setor 'Técnico'.")

# 3. Remove todos os outros setores
deleted_info = Sector.objects.exclude(id=tecnico_sector.id).delete()
print(f"Setores antigos deletados: {deleted_info[0]}")

print("Limpeza concluída com sucesso!")
