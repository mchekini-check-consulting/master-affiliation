import { Component, inject, signal } from '@angular/core';
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

  readonly erreur = signal(false);
  readonly enCours = signal(false);

  form = this.fb.nonNullable.group({
    identifiant: ['', [Validators.required, Validators.email]],
    motDePasse: ['', Validators.required],
  });

  soumettre(): void {
    this.erreur.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { identifiant, motDePasse } = this.form.getRawValue();
    this.enCours.set(true);
    this.auth.login(identifiant.trim(), motDePasse).subscribe({
      next: () => {
        this.enCours.set(false);
        this.router.navigate(['/app']);
      },
      error: () => {
        this.enCours.set(false);
        this.erreur.set(true);
      },
    });
  }
}
