import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Qualiopilote';
  // Message prérendu (SSG) : présent dans le HTML statique pour le SEO
  staticMessage = 'Hello World depuis le front-end Qualiopilote 👋';
  // Message récupéré côté navigateur depuis le back (GET /api/hello)
  apiMessage: string | null = null;
  apiError = false;

  constructor(private http: HttpClient) {}

  callBackend(): void {
    this.apiError = false;
    this.apiMessage = '…';
    this.http.get<{ message: string }>('/api/hello').subscribe({
      next: (res) => (this.apiMessage = res.message),
      error: () => {
        this.apiError = true;
        this.apiMessage = null;
      },
    });
  }
}
