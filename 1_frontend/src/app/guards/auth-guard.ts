import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { RestApiService } from '../services/rest-api.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(RestApiService);
  return auth.isLoggedIn();
};
