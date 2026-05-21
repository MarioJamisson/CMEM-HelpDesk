import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, take, catchError, of } from 'rxjs';

export const userGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const currentUser = authService.getCurrentUserValue();
  if (currentUser) {
    if (currentUser.is_staff || currentUser.is_superuser) {
      router.navigate(['/painel-tecnico']);
      return false;
    } else {
      return true;
    }
  }

  return authService.fetchCurrentUser().pipe(
    take(1),
    map(user => {
      if (user.is_staff || user.is_superuser) {
        router.navigate(['/painel-tecnico']);
        return false;
      } else {
        return true;
      }
    }),
    catchError(() => {
      authService.logout();
      return of(false);
    })
  );
};
