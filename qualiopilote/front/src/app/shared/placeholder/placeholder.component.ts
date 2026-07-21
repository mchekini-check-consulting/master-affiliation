import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

/**
 * Page générique « Bientôt disponible » réutilisée par toutes les rubriques du
 * back-office. Le titre et la description proviennent de `route.data`.
 */
@Component({
  selector: 'app-placeholder',
  imports: [LucideAngularModule],
  templateUrl: './placeholder.component.html',
  styleUrl: './placeholder.component.scss',
})
export class PlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  readonly data = toSignal(
    this.route.data.pipe(
      map((d) => ({
        titre: (d['titre'] as string) ?? 'Module',
        description: (d['description'] as string) ?? '',
      })),
    ),
    { initialValue: { titre: 'Module', description: '' } },
  );
}
