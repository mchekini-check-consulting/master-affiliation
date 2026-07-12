import { Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../../core/seo.service';
import { NavbarComponent } from '../../landing/navbar.component';
import { HeroSectionComponent } from '../../landing/hero-section.component';
import { ServicesSectionComponent } from '../../landing/services-section.component';
import { ComparisonSectionComponent } from '../../landing/comparison-section.component';
import { HowItWorksSectionComponent } from '../../landing/how-it-works-section.component';
import { MetricsSectionComponent } from '../../landing/metrics-section.component';
import { TestimonialsSectionComponent } from '../../landing/testimonials-section.component';
import { CtaBannerComponent } from '../../landing/cta-banner.component';
import { FaqSectionComponent } from '../../landing/faq-section.component';
import { FooterComponent } from '../../landing/footer.component';

@Component({
  selector: 'app-home',
  imports: [
    NavbarComponent,
    HeroSectionComponent,
    ServicesSectionComponent,
    ComparisonSectionComponent,
    HowItWorksSectionComponent,
    MetricsSectionComponent,
    TestimonialsSectionComponent,
    CtaBannerComponent,
    FaqSectionComponent,
    FooterComponent,
  ],
  template: `
    <div class="min-h-screen">
      <app-navbar />
      <app-hero-section />
      <app-services-section />
      <app-comparison-section />
      <app-how-it-works-section />
      <app-metrics-section />
      <app-testimonials-section />
      <app-cta-banner />
      <app-faq-section />
      <app-footer />
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.set({
      title: 'freelance-now — La plateforme tout-en-un des freelances IT',
      description: "Simulateurs de statuts, communauté, missions, bons plans et accompagnement : tout ce qu'il faut pour réussir en freelance IT, gratuitement.",
      path: '/Home',
    });
  }
}
