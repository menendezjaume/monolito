import { Component, OnInit } from '@angular/core';
import { RestApiService } from '../../services/rest-api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  profile: {
    message: string,
    user: {
      id: number,
      username: string,
      role: string,
      iat: number,
      exp: number
    }
  } | null = null;

  constructor(private restApiService: RestApiService) { };

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.restApiService.getProfile().subscribe((data) => {
      this.profile = data;
    });
  }
}
