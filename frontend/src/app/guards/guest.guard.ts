import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, take, catchError, of } from 'rxjs';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  const currentUser = authService.getCurrentUserValue();
  if (currentUser) {
    if (currentUser.is_staff || currentUser.is_superuser) {
      router.navigate(['/painel-tecnico']);
    } else {
      router.navigate(['/painel-usuario']);
    }
    return false;
  }

  return authService.fetchCurrentUser().pipe(
    take(1),
    map(user => {
      if (user.is_staff || user.is_superuser) {
        router.navigate(['/painel-tecnico']);
      } else {
        router.navigate(['/painel-usuario']);
      }
      return false;
    }),
    catchError(() => {
      return of(true);
    })
  );
};
