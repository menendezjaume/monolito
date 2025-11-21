import { Component } from '@angular/core';
import { RestApiService } from '../../services/rest-api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username: string = '';
  password: string = '';
  errorMsg: string = '';

  constructor(private restApiService: RestApiService, private router: Router) { }

  async onLogin() {
    try {
      const result = await firstValueFrom(this.restApiService.login(this.username, this.password))
      console.log('Login successful:', result);
      this.router.navigate(['/profile']);
    } catch (error) {
      this.errorMsg = 'Usuario o contraseña incorrectos';
      console.error('Login failed:', error);
    }
  }
}