import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  firstname: string = '';
  lastname: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  error: string = '';
  agreeToTerms: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    if (!this.agreeToTerms) {
      this.error = 'Please agree to the Terms & Privacy Policy';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.authService.register(this.firstname, this.lastname, this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.error = err.message || 'Registration failed';
      }
    });
  }

  isFormValid(): boolean {
    return this.firstname.trim() !== '' && this.lastname.trim() !== '' && this.email.trim() !== '' && this.password.trim() !== '' && this.confirmPassword.trim() !== '' && this.agreeToTerms;
  }
}
