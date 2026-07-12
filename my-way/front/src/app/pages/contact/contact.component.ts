import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Send, CheckCircle2, Mail, Phone, MapPin } from 'lucide-angular';
import { NavbarComponent } from '../../landing/navbar.component';
import { FooterComponent } from '../../landing/footer.component';
import { ContactService } from '../../core/contact.service';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, LucideAngularModule, NavbarComponent, FooterComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-navbar />
      <div class="pt-24 pb-16">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="anim-fade-up text-center mb-12">
            <span class="text-sm font-semibold text-blue-600 tracking-wide uppercase">Contact</span>
            <h1 class="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">
              Nous contacter
            </h1>
            <p class="mt-4 text-lg text-slate-500">
              Une question ? Une suggestion ? Nous sommes à votre écoute.
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Info cards -->
            <div class="anim-fade-up space-y-4">
              @for (item of infoCards; track item.title) {
                <div class="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-start gap-4">
                  <div class="p-2.5 bg-blue-50 rounded-lg">
                    <lucide-icon [img]="item.icon" class="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-slate-900 text-sm">{{ item.title }}</h3>
                    <p class="text-sm text-slate-500 mt-0.5">{{ item.text }}</p>
                  </div>
                </div>
              }
            </div>

            <!-- Form -->
            <div class="anim-fade-up lg:col-span-2" style="animation-delay: 0.1s">
              @if (sent) {
                <div class="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 text-center">
                  <div class="anim-scale-in">
                    <lucide-icon [img]="ic.CheckCircle2" class="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                  </div>
                  <h2 class="text-2xl font-bold text-slate-900 mb-2">Message envoyé !</h2>
                  <p class="text-slate-500">Nous vous répondrons dans les plus brefs délais.</p>
                  <button class="ui-btn ui-btn-outline mt-6" (click)="reset()">
                    Envoyer un autre message
                  </button>
                </div>
              } @else {
                <form (ngSubmit)="handleSubmit()" class="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8 space-y-5">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="ui-label text-sm font-semibold text-slate-700">Prénom *</label>
                      <input class="ui-input mt-1.5" name="first_name" [(ngModel)]="form.first_name" required />
                    </div>
                    <div>
                      <label class="ui-label text-sm font-semibold text-slate-700">Nom *</label>
                      <input class="ui-input mt-1.5" name="last_name" [(ngModel)]="form.last_name" required />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="ui-label text-sm font-semibold text-slate-700">Email *</label>
                      <input type="email" class="ui-input mt-1.5" name="email" [(ngModel)]="form.email" required />
                    </div>
                    <div>
                      <label class="ui-label text-sm font-semibold text-slate-700">Téléphone</label>
                      <input class="ui-input mt-1.5" name="phone" [(ngModel)]="form.phone" />
                    </div>
                  </div>
                  <div>
                    <label class="ui-label text-sm font-semibold text-slate-700">Sujet *</label>
                    <select class="ui-input ui-select mt-1.5" name="subject" [(ngModel)]="form.subject">
                      <option value="" disabled>Choisir un sujet</option>
                      @for (s of subjects; track s.value) {
                        <option [value]="s.value">{{ s.label }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="ui-label text-sm font-semibold text-slate-700">Message *</label>
                    <textarea class="ui-input ui-textarea mt-1.5" name="message" [(ngModel)]="form.message" required rows="5"></textarea>
                  </div>
                  <div class="flex items-start gap-2">
                    <input type="checkbox" id="rgpd" class="ui-checkbox mt-0.5" [(ngModel)]="rgpd" name="rgpd" />
                    <label for="rgpd" class="text-xs text-slate-500 leading-relaxed cursor-pointer">
                      J'accepte que mes données soient traitées conformément à la politique de confidentialité d'freelance-now.
                    </label>
                  </div>
                  <button
                    type="submit"
                    [disabled]="!rgpd || sending || !form.subject"
                    class="ui-btn w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white py-5 text-base rounded-xl">
                    @if (sending) {
                      <span class="flex items-center gap-2">
                        <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Envoi en cours...
                      </span>
                    } @else {
                      <span class="flex items-center gap-2">
                        <lucide-icon [img]="ic.Send" class="w-4 h-4" />
                        Envoyer mon message
                      </span>
                    }
                  </button>
                </form>
              }
            </div>
          </div>
        </div>
      </div>
      <app-footer />
    </div>
  `,
})
export class ContactComponent implements OnInit {
  private contactService = inject(ContactService);
  private seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.set({
      title: 'Contact — freelance-now',
      description: "Une question, une suggestion, un partenariat ? Contactez l'équipe freelance-now, nous sommes à votre écoute.",
      path: '/Contact',
    });
  }
  protected readonly ic = { Send, CheckCircle2, Mail, Phone, MapPin };

  form = { first_name: '', last_name: '', email: '', phone: '', subject: '', message: '' };
  rgpd = false;
  sent = false;
  sending = false;

  protected readonly subjects = [
    { value: 'question_generale', label: 'Question générale' },
    { value: 'devenir_partenaire', label: 'Devenir partenaire' },
    { value: 'signaler_probleme', label: 'Signaler un problème' },
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'mise_en_relation', label: 'Demande de mise en relation' },
    { value: 'autre', label: 'Autre' },
  ];

  protected readonly infoCards = [
    { icon: Mail, title: 'Email', text: 'contact@freelance-now.fr' },
    { icon: Phone, title: 'Téléphone', text: '+33 1 23 45 67 89' },
    { icon: MapPin, title: 'Localisation', text: 'Paris, France' },
  ];

  async handleSubmit(): Promise<void> {
    if (!this.rgpd) return;
    this.sending = true;
    await this.contactService.send(this.form);
    this.sending = false;
    this.sent = true;
  }

  reset(): void {
    this.sent = false;
    this.form = { first_name: '', last_name: '', email: '', phone: '', subject: '', message: '' };
    this.rgpd = false;
  }
}
