import { Directive, ElementRef, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Équivalent du whileInView de framer-motion : ajoute la classe .in-view
// quand l'élément entre dans le viewport (une seule fois).
// Au prérendu (serveur), on n'anime pas : le HTML statique reste visible.
@Directive({ selector: '[appInView]' })
export class InViewDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.el.nativeElement.classList.add('fade-up-on-view');
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.el.nativeElement.classList.add('in-view');
            this.observer?.disconnect();
          }
        }
      },
      { threshold: 0.15 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
