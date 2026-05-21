import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { AuthService, UserProfile } from '../../services/auth.service';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-form.html',
  styleUrls: ['./ticket-form.css']
})
export class TicketFormComponent implements OnInit {
  ticket = {
    titulo: '',
    setor: '',
    categoria: 'Computador', // Valor padrão inicial
    prioridade: 'Média',
    descricao: ''
  };

  sectors: any[] = [];
  currentUser: UserProfile | null = null;
  isSubmitting = false;
  success = false;
  errorMessage = '';

  constructor(
    private router: Router, 
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserValue();
    this.loadSectors();
  }

  loadSectors() {
    this.ticketService.getSectors().subscribe({
      next: (data) => {
        this.sectors = data;
        const tecnicoSector = data.find(s => s.nome.toLowerCase() === 'técnico' || s.nome.toLowerCase() === 'tecnico');
        if (tecnicoSector) {
          this.ticket.setor = tecnicoSector.id.toString();
        } else if (data.length > 0) {
          this.ticket.setor = data[0].id.toString();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar setores', err);
      }
    });
  }

  submitTicket() {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.success = false;

    const payload = {
      titulo: this.ticket.titulo,
      descricao: this.ticket.descricao,
      categoria: this.ticket.categoria,
      prioridade: this.ticket.prioridade,
      setor: Number(this.ticket.setor)
    };

    this.ticketService.createTicket(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.success = true;
        setTimeout(() => {
          this.success = false;
          // reset form
          const defaultSetorId = this.sectors.find(s => s.nome.toLowerCase() === 'técnico' || s.nome.toLowerCase() === 'tecnico')?.id?.toString() || '';
          this.ticket = {
            titulo: '',
            setor: defaultSetorId,
            categoria: 'Computador',
            prioridade: 'Média',
            descricao: ''
          };
          this.voltarPainel();
        }, 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'Erro ao abrir chamado. Por favor, verifique os campos.';
        console.error('Erro ao registrar chamado', err);
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  voltarPainel() {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/painel-tecnico']);
    } else {
      this.router.navigate(['/painel-usuario']);
    }
  }
}
