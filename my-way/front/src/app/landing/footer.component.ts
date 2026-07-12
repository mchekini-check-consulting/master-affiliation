import { Component } from '@angular/core';
import { LucideAngularModule, Zap } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  imports: [LucideAngularModule],
  template: `
    <footer class="bg-slate-900 text-slate-400 pt-16 pb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div class="col-span-2 md:col-span-1">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <lucide-icon [img]="ic.Zap" class="w-5 h-5 text-white" />
              </div>
              <span class="text-lg font-bold text-white">freelance-now</span>
            </div>
            <p class="text-sm leading-relaxed">
              La plateforme tout-en-un créée par des indépendants, pour des indépendants IT en France.
            </p>
          </div>

          <div>
            <h4 class="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Services</h4>
            <ul class="space-y-2.5 text-sm">
              <li><span class="hover:text-white transition-colors cursor-pointer">Simulateurs</span></li>
              <li><span class="hover:text-white transition-colors cursor-pointer">Communauté</span></li>
              <li><span class="hover:text-white transition-colors cursor-pointer">Missions</span></li>
              <li><span class="hover:text-white transition-colors cursor-pointer">Documentation</span></li>
            </ul>
          </div>

          <div>
            <h4 class="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Ressources</h4>
            <ul class="space-y-2.5 text-sm">
              <li><span class="hover:text-white transition-colors cursor-pointer">Bons plans</span></li>
              <li><span class="hover:text-white transition-colors cursor-pointer">Partenaires</span></li>
              <li><span class="hover:text-white transition-colors cursor-pointer">Accompagnement</span></li>
              <li><span class="hover:text-white transition-colors cursor-pointer">Blog</span></li>
            </ul>
          </div>

          <div>
            <h4 class="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Légal</h4>
            <ul class="space-y-2.5 text-sm">
              <li><span class="hover:text-white transition-colors cursor-pointer">CGU</span></li>
              <li><span class="hover:text-white transition-colors cursor-pointer">Confidentialité</span></li>
              <li><span class="hover:text-white transition-colors cursor-pointer">Mentions légales</span></li>
              <li><span class="hover:text-white transition-colors cursor-pointer">Contact</span></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-slate-800 pt-8 text-center text-sm">
          <p>© {{ year }} freelance-now. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly ic = { Zap };
  protected readonly year = new Date().getFullYear();
}
