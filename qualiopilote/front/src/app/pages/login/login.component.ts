import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  erreur = false;

  form = this.fb.nonNullable.group({
    identifiant: ['', Validators.required],
    motDePasse: ['', Validators.required],
  });

  soumettre(): void {
    this.erreur = false;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { identifiant, motDePasse } = this.form.getRawValue();
    if (this.auth.login(identifiant, motDePasse)) {
      this.router.navigate(['/app']);
    } else {
      this.erreur = true;
    }
  }
}
