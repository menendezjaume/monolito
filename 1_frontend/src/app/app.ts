import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { RestApiService } from './services/rest-api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  protected readonly auth = inject(RestApiService);
  protected readonly router = inject(Router);


  logout() {
    this.auth.logout();
    this.router.navigate(['/home']);
  }

}
