import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService, Ticket } from '../../services/ticket.service';
import { AuthService, UserProfile } from '../../services/auth.service';

@Component({
  selector: 'app-tech-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tech-panel.html',
  styleUrls: ['./tech-panel.css']
})
export class TechPanelComponent implements OnInit {
  tickets: Ticket[] = [];
  users: UserProfile[] = [];
  currentUser: UserProfile | null = null;
  activeTab: 'tickets' | 'users' = 'tickets';
  selectedFilter = 'Todos';
  isLoading = true;
  isLoadingUsers = false;
  selectedTicket: Ticket | null = null;
  isUpdatingStatus = false;

  logs: any[] = [];
  showNotifications = false;
  showAddUserModal = false;
  newUser = { email: '', password: '', first_name: '', last_name: '' };
  isAddingUser = false;
  addUserError = '';

  messages: any[] = [];
  newMessageText = '';
  isSendingMessage = false;

  constructor(
    private router: Router, 
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserValue();
    this.loadTickets();
    this.loadUsers();
    this.loadLogs();
  }

  loadTickets() {
    this.isLoading = true;
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar chamados', err);
        this.isLoading = false;
      }
    });
  }

  loadUsers() {
    this.isLoadingUsers = true;
    this.authService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoadingUsers = false;
      },
      error: (err) => {
        console.error('Erro ao carregar funcionárias', err);
        this.isLoadingUsers = false;
      }
    });
  }

  loadLogs() {
    this.ticketService.getLogs().subscribe({
      next: (data) => {
        this.logs = data;
      },
      error: (err) => {
        console.error('Erro ao carregar logs/notificações', err);
      }
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loadLogs();
    }
  }

  selectTicket(ticket: Ticket) {
    this.selectedTicket = { ...ticket }; // Cria uma cópia rasa para edições temporárias no status
    if (ticket.id) {
      this.loadMessages(ticket.id);
    }
  }

  closeTicketDetails() {
    this.selectedTicket = null;
    this.messages = [];
    this.newMessageText = '';
  }

  loadMessages(ticketId: number) {
    this.ticketService.getMessages(ticketId).subscribe({
      next: (data) => {
        this.messages = data;
      },
      error: (err) => {
        console.error('Erro ao carregar mensagens', err);
      }
    });
  }

  sendMessage() {
    if (!this.newMessageText.trim() || !this.selectedTicket || !this.selectedTicket.id) return;
    this.isSendingMessage = true;
    
    this.ticketService.addMessage(this.selectedTicket.id, this.newMessageText).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.newMessageText = '';
        this.isSendingMessage = false;
      },
      error: (err) => {
        console.error('Erro ao enviar mensagem', err);
        this.isSendingMessage = false;
      }
    });
  }

  updateStatus(newStatus: string) {
    if (!this.selectedTicket || !this.selectedTicket.id) return;
    this.isUpdatingStatus = true;
    this.ticketService.updateTicketStatus(this.selectedTicket.id, newStatus).subscribe({
      next: () => {
        this.isUpdatingStatus = false;
        // Atualiza na lista local
        const index = this.tickets.findIndex(t => t.id === this.selectedTicket?.id);
        if (index !== -1) {
          this.tickets[index].status = newStatus;
        }
        if (this.selectedTicket) {
          this.selectedTicket.status = newStatus;
        }
        this.loadTickets(); // Recarrega para obter todos os dados atualizados do backend
        this.loadLogs();
      },
      error: (err) => {
        this.isUpdatingStatus = false;
        console.error('Erro ao atualizar status', err);
      }
    });
  }

  acceptTicket() {
    if (!this.selectedTicket || !this.selectedTicket.id || !this.currentUser) return;
    this.isUpdatingStatus = true;
    const payload = {
      status: 'Em análise',
      tecnico_responsavel: this.currentUser.id
    };
    this.ticketService.updateTicket(this.selectedTicket.id, payload).subscribe({
      next: () => {
        this.isUpdatingStatus = false;
        const index = this.tickets.findIndex(t => t.id === this.selectedTicket?.id);
        if (index !== -1) {
          this.tickets[index] = { ...this.tickets[index], ...payload, tecnico_responsavel: this.currentUser?.id };
        }
        if (this.selectedTicket) {
          this.selectedTicket.status = 'Em análise';
          this.selectedTicket.tecnico_responsavel = this.currentUser?.id;
        }
        this.loadTickets();
        this.loadLogs();
      },
      error: (err) => {
        this.isUpdatingStatus = false;
        console.error('Erro ao aceitar chamado', err);
      }
    });
  }

  rejectTicket() {
    if (!this.selectedTicket || !this.selectedTicket.id) return;
    this.isUpdatingStatus = true;
    const payload = {
      status: 'Cancelado'
    };
    this.ticketService.updateTicket(this.selectedTicket.id, payload).subscribe({
      next: () => {
        this.isUpdatingStatus = false;
        const index = this.tickets.findIndex(t => t.id === this.selectedTicket?.id);
        if (index !== -1) {
          this.tickets[index].status = 'Cancelado';
        }
        if (this.selectedTicket) {
          this.selectedTicket.status = 'Cancelado';
        }
        this.loadTickets();
        this.loadLogs();
      },
      error: (err) => {
        this.isUpdatingStatus = false;
        console.error('Erro ao recusar chamado', err);
      }
    });
  }

  deleteUser(userId: number) {
    if (this.currentUser?.id === userId) {
      alert('Você não pode excluir o seu próprio usuário administrador.');
      return;
    }
    if (!confirm('Tem certeza que deseja excluir esta funcionária?')) return;
    this.authService.deleteUser(userId).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => {
        console.error('Erro ao excluir funcionária', err);
        alert('Não foi possível excluir a funcionária.');
      }
    });
  }

  openAddUserModal() {
    this.showAddUserModal = true;
    this.newUser = { email: '', password: '', first_name: '', last_name: '' };
    this.addUserError = '';
  }

  closeAddUserModal() {
    this.showAddUserModal = false;
  }

  addUser() {
    if (!this.newUser.email || !this.newUser.password || !this.newUser.first_name) {
      this.addUserError = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }
    this.isAddingUser = true;
    this.addUserError = '';

    const payload = {
      email: this.newUser.email,
      password: this.newUser.password,
      first_name: this.newUser.first_name,
      last_name: this.newUser.last_name
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isAddingUser = false;
        this.closeAddUserModal();
        this.loadUsers();
      },
      error: (err) => {
        this.isAddingUser = false;
        if (err.error && typeof err.error === 'object') {
          const keys = Object.keys(err.error);
          if (keys.length > 0) {
            this.addUserError = err.error[keys[0]][0] || err.error[keys[0]];
          } else {
            this.addUserError = 'Erro ao cadastrar funcionária.';
          }
        } else {
          this.addUserError = 'Erro ao cadastrar funcionária.';
        }
      }
    });
  }

  get filteredTickets() {
    if (this.selectedFilter === 'Todos') return this.tickets;
    return this.tickets.filter(t => t.status === this.selectedFilter);
  }

  setActiveTab(tab: 'tickets' | 'users') {
    this.activeTab = tab;
    if (tab === 'tickets') {
      this.loadTickets();
    } else {
      this.loadUsers();
    }
  }

  logout() {
    this.authService.logout();
  }

  getInitials(firstName?: string, lastName?: string): string {
    const f = firstName ? firstName.charAt(0) : '';
    const l = lastName ? lastName.charAt(0) : '';
    return (f + l).toUpperCase() || 'TI';
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Aberto': return 'bg-red-100 text-red-800 border-red-200';
      case 'Em análise': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Aguardando resposta da solicitante': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Resolvido': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Finalizado': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  }

  getPriorityIcon(priority: string | undefined) {
    if (!priority) return '';
    switch (priority) {
      case 'Baixa': return 'ph-arrow-down text-emerald-500';
      case 'Média': return 'ph-minus text-blue-500';
      case 'Alta': return 'ph-arrow-up text-orange-500';
      case 'Crítica': return 'ph-warning-circle text-red-600';
      default: return '';
    }
  }

  formatTime(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
  }

  navigateNovoChamado() {
    this.router.navigate(['/novo-chamado']);
  }
}
