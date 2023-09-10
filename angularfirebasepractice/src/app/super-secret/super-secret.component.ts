import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-super-secret',
  templateUrl: './super-secret.component.html',
  styleUrls: ['./super-secret.component.scss']
})
export class SuperSecretComponent {

  constructor(public authService: AuthService) { }

  addNewPost() {
    this.authService.addNewPost();
  }

  posts = []
  ngOnInit() {
    this.authService.getPosts().subscribe((posts) => {
      this.posts = posts
      console.log(this.posts)
    })

  }
}
