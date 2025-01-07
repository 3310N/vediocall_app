import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent {
  meetingId: string = '';
  isLoggedIn: boolean = false;
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.currentUser = this.authService.getCurrentUser();
    }
  }

  startVideoCall() {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/videocall']);
  }

  joinMeeting() {
    if (!this.meetingId) {
      return;
    }
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/videocall'], { 
      queryParams: { meetingId: this.meetingId }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
      }
    });
  }
}
