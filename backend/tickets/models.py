from django.db import models
from django.contrib.auth.models import User

class Sector(models.Model):
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome

class Ticket(models.Model):
    STATUS_CHOICES = [
        ('Aberto', 'Aberto'),
        ('Em análise', 'Em análise'),
        ('Aguardando resposta da solicitante', 'Aguardando resposta da solicitante'),
        ('Aguardando atendimento presencial', 'Aguardando atendimento presencial'),
        ('Resolvido', 'Resolvido'),
        ('Finalizado', 'Finalizado'),
        ('Cancelado', 'Cancelado'),
    ]

    PRIORITY_CHOICES = [
        ('Baixa', 'Baixa'),
        ('Média', 'Média'),
        ('Alta', 'Alta'),
        ('Crítica', 'Crítica'),
    ]

    ATTENDANCE_TYPE_CHOICES = [
        ('Remoto', 'Remoto'),
        ('Presencial', 'Presencial'),
    ]

    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    categoria = models.CharField(max_length=100)
    prioridade = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Média')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Aberto')
    tipo_atendimento = models.CharField(max_length=20, choices=ATTENDANCE_TYPE_CHOICES, null=True, blank=True)
    
    criado_por = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets_criados', null=True)
    tecnico_responsavel = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets_atendidos')
    setor = models.ForeignKey(Sector, on_delete=models.SET_NULL, null=True, blank=True)
    
    imagem = models.ImageField(upload_to='chamados/', null=True, blank=True)
    
    data_abertura = models.DateTimeField(auto_now_add=True)
    data_fechamento = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.id} - {self.titulo}"

class TicketMessage(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='messages')
    autor = models.ForeignKey(User, on_delete=models.CASCADE)
    mensagem = models.TextField()
    data_envio = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message by {self.autor} on Ticket {self.ticket_id}"

class TicketLog(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='logs')
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    acao = models.CharField(max_length=255)
    data = models.DateTimeField(auto_now_add=True)
