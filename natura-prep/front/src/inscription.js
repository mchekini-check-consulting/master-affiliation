import './pwa.js';
import '@fontsource/archivo/700.css';
import '@fontsource/archivo/800.css';
import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/public-sans/700.css';
import './auth.css';
import { brancherFormulaire } from './api.js';

brancherFormulaire(document.querySelector('[data-form-inscription]'), (d) => [
  '/auth/register',
  { corps: { nom: d.nom, email: d.email, mot_de_passe: d.mot_de_passe } },
]);
