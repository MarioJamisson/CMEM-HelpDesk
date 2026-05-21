import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { LayoutComponent } from './pages/layout/layout';
import { TicketFormComponent } from './pages/ticket-form/ticket-form';
import { TechPanelComponent } from './pages/tech-panel/tech-panel';
import { UserPanelComponent } from './pages/user-panel/user-panel';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { adminGuard } from './guards/admin.guard';
import { userGuard } from './guards/user.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'cadastro', component: RegisterComponent, canActivate: [guestGuard] },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'novo-chamado', component: TicketFormComponent },
      { path: 'painel-tecnico', component: TechPanelComponent, canActivate: [adminGuard] },
      { path: 'painel-usuario', component: UserPanelComponent, canActivate: [userGuard] },
      { path: '', redirectTo: 'painel-usuario', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
