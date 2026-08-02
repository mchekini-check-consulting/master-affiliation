// Petit client de l'API NaturaPrep (session par cookie, JSON snake_case).

export async function api(chemin, options = {}) {
  const reponse = await fetch(`/api${chemin}`, {
    headers: options.corps ? { 'Content-Type': 'application/json' } : {},
    method: options.methode || (options.corps ? 'POST' : 'GET'),
    body: options.corps ? JSON.stringify(options.corps) : undefined,
    credentials: 'same-origin',
  });
  let donnees = null;
  try {
    donnees = await reponse.json();
  } catch {
    /* réponse vide (ex. logout) */
  }
  if (!reponse.ok) {
    const message =
      (donnees && (donnees.message || donnees.error)) ||
      'Une erreur est survenue, réessayez.';
    throw new Error(message);
  }
  return donnees;
}

/** Branche un formulaire d'auth : envoi JSON, gestion d'erreur, redirection. */
export function brancherFormulaire(form, construireRequete) {
  const alerte = document.querySelector('[data-alerte]');
  const bouton = form.querySelector('[data-bouton]');
  const libelle = bouton.textContent;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    alerte.hidden = true;
    bouton.disabled = true;
    bouton.textContent = 'Un instant…';
    try {
      const donnees = Object.fromEntries(new FormData(form));
      await api(...construireRequete(donnees));
      window.location.href = '/espace/';
    } catch (erreur) {
      alerte.textContent = erreur.message;
      alerte.hidden = false;
      bouton.disabled = false;
      bouton.textContent = libelle;
    }
  });
}
