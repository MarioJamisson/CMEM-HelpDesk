import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ticket {
  id?: number;
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: string;
  status: string;
  tipo_atendimento?: string;
  criado_por?: number;
  criado_por_detalhes?: any;
  tecnico_responsavel?: number;
  setor?: number;
  setor_nome?: string;
  data_abertura?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private get apiUrl() {
    const host = window.location.hostname;
    
    // 1. Check if running on localhost or local network IP
    if (
      host === 'localhost' || 
      host === '127.0.0.1' || 
      host.startsWith('192.168.') || 
      host.startsWith('10.') || 
      host.startsWith('172.')
    ) {
      return `http://${host}:8000/api`;
    }
    
    // 2. Check for runtime configuration from config.json
    const windowConfig = (window as any).appConfig;
    if (windowConfig && windowConfig.apiUrl) {
      return windowConfig.apiUrl;
    }

    // 3. Fallback for custom overrides
    const customApiUrl = localStorage.getItem('API_URL');
    if (customApiUrl) {
      return customApiUrl;
    }
    
    // 4. Default fallback URL (useful as placeholder)
    return 'https://seu-backend.onrender.com/api';
  }

  constructor(private http: HttpClient) { }

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets/`);
  }

  createTicket(ticket: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tickets/`, ticket);
  }

  updateTicketStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/tickets/${id}/`, { status });
  }

  updateTicket(id: number, payload: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/tickets/${id}/`, payload);
  }

  getSectors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sectors/`);
  }

  getMessages(ticketId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/messages/?ticket=${ticketId}`);
  }

  addMessage(ticketId: number, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages/`, { ticket: ticketId, mensagem: message });
  }

  getLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/logs/`);
  }
}
