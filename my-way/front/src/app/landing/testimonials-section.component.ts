import { Component, OnDestroy, OnInit } from '@angular/core';
import { InViewDirective } from '../core/in-view.directive';

@Component({
  selector: 'app-testimonials-section',
  imports: [InViewDirective],
  template: `
    <section class="py-20 bg-white">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div appInView class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Ils nous font confiance
          </h2>
          <p class="text-lg text-slate-600">
            Rejoignez des centaines de freelances satisfaits
          </p>
        </div>

        <div class="relative">
          @for (t of testimonials; track t.name; let i = $index) {
            @if (i === current) {
              <div class="anim-scale-in relative">
                <div class="bg-white rounded-2xl shadow-xl border border-slate-200 p-10">
                  <div class="flex items-start gap-6 mb-6">
                    <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                      {{ t.avatar }}
                    </div>
                    <div class="flex-1">
                      <h4 class="text-lg font-bold text-slate-900">{{ t.name }}</h4>
                      <p class="text-sm text-slate-600">{{ t.role }}</p>
                    </div>
                  </div>
                  <p class="text-lg text-slate-700 leading-relaxed italic">
                    "{{ t.text }}"
                  </p>
                </div>
              </div>
            }
          }

          <div class="flex justify-center items-center gap-3 mt-8">
            @for (t of testimonials; track t.name; let i = $index) {
              <button
                (click)="current = i"
                class="h-2.5 rounded-full transition-all duration-300"
                [class]="i === current ? 'bg-blue-600 w-8' : 'bg-slate-300 hover:bg-slate-400 w-2.5'"
                [attr.aria-label]="'Go to testimonial ' + (i + 1)"></button>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class TestimonialsSectionComponent implements OnInit, OnDestroy {
  protected current = 0;
  private interval?: ReturnType<typeof setInterval>;

  protected readonly testimonials = [
    {
      name: 'Thomas D.',
      role: 'Dev Full-Stack • Paris',
      text: "Le simulateur m'a aidé à comprendre en 5 minutes ce que je n'avais pas compris en 6 mois de recherches. La différence entre AE et SASU est devenue limpide.",
      avatar: 'TD',
    },
    {
      name: 'Sophie L.',
      role: 'Data Engineer • Lyon',
      text: "Communauté super active, j'ai trouvé des réponses à toutes mes questions fiscales en moins d'une heure. Les bons plans m'ont fait économiser 2000€ cette année.",
      avatar: 'SL',
    },
    {
      name: 'Marc R.',
      role: 'DevOps • Bordeaux',
      text: "Grâce aux alertes missions et à l'apport d'affaires, j'ai toujours des pistes. L'accompagnement m'a permis de valoriser mon profil et d'augmenter mon TJM de 20%.",
      avatar: 'MR',
    },
  ];

  ngOnInit(): void {
    this.interval = setInterval(() => {
      this.current = (this.current + 1) % this.testimonials.length;
    }, 6000);
  }

  ngOnDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }
}
