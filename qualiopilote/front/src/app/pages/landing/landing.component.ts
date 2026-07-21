import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

interface Atout {
  icone: string;
  titre: string;
  texte: string;
}

@Component({
  selector: 'app-landing',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  annee = new Date().getFullYear();

  atouts: Atout[] = [
    {
      icone: 'shield-check',
      titre: 'Conforme Qualiopi',
      texte:
        "Générez automatiquement conventions, convocations, certificats et émargements — tracés et prêts pour l'audit.",
    },
    {
      icone: 'file-text',
      titre: 'Documents à variables',
      texte:
        'Une bibliothèque de modèles fusionnés au niveau de chaque session : plus de copier-coller, zéro oubli.',
    },
    {
      icone: 'users-round',
      titre: 'Extranets dédiés',
      texte:
        'Apprenants, clients et formateurs accèdent à leurs sessions, documents, questionnaires et signatures.',
    },
    {
      icone: 'sparkles',
      titre: 'Automatisations',
      texte:
        "Convocations, enquêtes à chaud et à froid, certificats : déclenchés aux bons jalons de la session.",
    },
  ];
}
