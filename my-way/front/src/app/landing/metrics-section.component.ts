import { Component, ElementRef, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Metric { value: number; suffix: string; label: string; prefix: string; count: number; }

@Component({
  selector: 'app-metrics-section',
  template: `
    <section class="py-20 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
          @for (metric of metrics; track metric.label) {
            <div class="text-center">
              <div class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-2">
                {{ metric.prefix }}{{ metric.count.toLocaleString('fr-FR') }}{{ metric.suffix }}
              </div>
              <p class="text-sm sm:text-base text-blue-200/70">{{ metric.label }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class MetricsSectionComponent implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;
  private timers: ReturnType<typeof setInterval>[] = [];

  protected metrics: Metric[] = [
    { value: 2500, suffix: '+', label: 'Freelances accompagnés', prefix: '', count: 0 },
    { value: 200, suffix: '+', label: 'Articles & ressources', prefix: '', count: 0 },
    { value: 50, suffix: '+', label: 'Partenaires vérifiés', prefix: '', count: 0 },
    { value: 500, suffix: '+', label: 'Missions partagées/mois', prefix: '', count: 0 },
  ];

  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // Prérendu : afficher directement les valeurs finales dans le HTML
      this.metrics.forEach(m => m.count = m.value);
      return;
    }
    this.observer = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        this.startCounters();
        this.observer?.disconnect();
      }
    }, { threshold: 0.3 });
    this.observer.observe(this.el.nativeElement);
  }

  private startCounters(): void {
    for (const metric of this.metrics) {
      const duration = 2000;
      const increment = metric.value / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= metric.value) {
          metric.count = metric.value;
          clearInterval(timer);
        } else {
          metric.count = Math.floor(current);
        }
      }, 16);
      this.timers.push(timer);
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.timers.forEach(clearInterval);
  }
}
