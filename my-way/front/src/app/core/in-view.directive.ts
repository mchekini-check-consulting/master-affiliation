import { Directive, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';

// Équivalent du whileInView de framer-motion : ajoute la classe .in-view
// quand l'élément entre dans le viewport (une seule fois).
@Directive({ selector: '[appInView]' })
export class InViewDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
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
