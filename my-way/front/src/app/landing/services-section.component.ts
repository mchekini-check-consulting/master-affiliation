import { Component } from '@angular/core';
import { LucideAngularModule, Calculator, Users, Tag, Handshake, Briefcase, Scale, Rocket, BookOpen } from 'lucide-angular';
import { InViewDirective } from '../core/in-view.directive';

@Component({
  selector: 'app-services-section',
  imports: [LucideAngularModule, InViewDirective],
  template: `
    <section id="services" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div appInView class="text-center mb-16">
          <h2 class="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6">
            Tout ce qu'il vous faut pour <span class="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">réussir</span>
          </h2>
          <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Une plateforme complète pensée pour les besoins des freelances IT
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (service of services; track service.title) {
            <div
              appInView
              class="group bg-white rounded-2xl p-6 border-2 border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
              <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-4 group-hover:bg-blue-100 transition-colors">
                <lucide-icon [img]="service.icon" class="w-6 h-6 text-blue-600" />
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-2">{{ service.title }}</h3>
              <p class="text-sm text-blue-600 font-medium mb-2">{{ service.tagline }}</p>
              <p class="text-sm text-slate-600 leading-relaxed">{{ service.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class ServicesSectionComponent {
  protected readonly services = [
    {
      icon: Calculator,
      title: 'Simulateurs',
      tagline: 'Simulez votre avenir en 2 minutes',
      description: 'Comparez Auto-entrepreneur, SASU, EURL et Portage. Découvrez combien vous gagnerez vraiment.',
    },
    {
      icon: Users,
      title: 'Communauté',
      tagline: 'La plus grande communauté freelance IT',
      description: 'Forum thématique, publication anonyme, échangez avec des milliers de freelances.',
    },
    {
      icon: Tag,
      title: 'Bons Plans',
      tagline: 'Réductions exclusives sur vos outils IT',
      description: 'Codes promo négociés sur hébergement, IDE, compta, cloud et plus encore.',
    },
    {
      icon: Handshake,
      title: 'Partenaires',
      tagline: 'Experts-comptables, avocats, fiscalistes',
      description: 'Annuaire de partenaires vérifiés avec offres négociées et mise en relation directe.',
    },
    {
      icon: Briefcase,
      title: 'Missions',
      tagline: 'Partagez, recommandez, gagnez ensemble',
      description: "Tableau de missions filtrable avec alertes personnalisées et apport d'affaires.",
    },
    {
      icon: Scale,
      title: 'Portage Salarial',
      tagline: 'Comparez en toute transparence',
      description: 'Comparateur interactif avec taux réels, frais cachés, services inclus et avis.',
    },
    {
      icon: Rocket,
      title: 'Accompagnement',
      tagline: 'CV, profil, entretiens : on vous prépare',
      description: 'Rédaction de CV, préparation entretiens, optimisation LinkedIn, stratégie missions.',
    },
    {
      icon: BookOpen,
      title: 'Documentation',
      tagline: 'Tout savoir pour se lancer',
      description: 'Articles complets sur statuts, fiscalité, protection sociale, démarches admin.',
    },
  ];
}
