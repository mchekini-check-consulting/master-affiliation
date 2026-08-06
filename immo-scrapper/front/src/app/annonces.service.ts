import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Annonce telle que servie par l'API (JSON snake_case). */
export interface Annonce {
  id: number;
  type: string;
  adresse: string;
  ville: string;
  prix: number;
  prix_m2: number;
  surface_m2: number;
  audience: string; // ISO : 2026-08-12T10:30:00
  statut: 'Libre' | 'Occupé' | 'Loué' | 'Inconnu';
  url: string;
  descriptif?: string;
  carte_url?: string;
  photo_disponible?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AnnoncesService {
  private readonly http = inject(HttpClient);

  lister(): Observable<Annonce[]> {
    return this.http.get<Annonce[]>('/api/v1/annonces');
  }
}
