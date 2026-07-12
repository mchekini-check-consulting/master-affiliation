import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Simulation } from './models';

@Injectable({ providedIn: 'root' })
export class SimulationService {
  private http = inject(HttpClient);

  list(limit?: number): Promise<Simulation[]> {
    const params = limit ? { params: { limit } } : {};
    return firstValueFrom(this.http.get<Simulation[]>('/api/simulations', params));
  }

  create(simulation: Simulation): Promise<Simulation> {
    return firstValueFrom(this.http.post<Simulation>('/api/simulations', simulation));
  }

  delete(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/simulations/${id}`));
  }
}
