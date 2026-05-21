import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService, Ticket } from '../../services/ticket.service';
import { AuthService, UserProfile } from '../../services/auth.service';

@Component({
  selector: 'app-user-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-panel.html',
  styleUrls: ['./user-panel.css']
})
export class UserPanelComponent implements OnInit {
  tickets: Ticket[] = [];
  currentUser: UserProfile | null = null;
  isLoading = true;
  selectedTicket: Ticket | null = null;
  messages: any[] = [];
  newMessageText = '';
  isSendingMessage = false;
  selectedFilter = 'Todos';

  constructor(
    private router: Router, 
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserValue();
    this.loadTickets();
  }

  loadTickets() {
    this.isLoading = true;
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar seus chamados', err);
        this.isLoading = false;
      }
    });
  }

  selectTicket(ticket: Ticket) {
    this.selectedTicket = ticket;
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

  get filteredTickets() {
    if (this.selectedFilter === 'Todos') return this.tickets;
    return this.tickets.filter(t => t.status === this.selectedFilter);
  }

  logout() {
    this.authService.logout();
  }

  getInitials(firstName?: string, lastName?: string): string {
    const f = firstName ? firstName.charAt(0) : '';
    const l = lastName ? lastName.charAt(0) : '';
    return (f + l).toUpperCase() || 'U';
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
