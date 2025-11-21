import { Component } from '@angular/core';
import { RestApiService } from '../../services/rest-api.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  posts: any[] = [];

  constructor(private api: RestApiService) { }

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.api.getPosts().subscribe((data) => {
      this.posts = data;
    });
  }
}
