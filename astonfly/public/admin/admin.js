/* Admin Astonfly — articles, catégories, événements.
   Auth Basic (mêmes credentials que l'API), état en mémoire, zéro dépendance. */

const Admin = (() => {
  const API = '/api/v1';
  const LANGUES = [
    { code: 'en', label: 'English 🇬🇧' },
    { code: 'pt', label: 'Português 🇵🇹' },
    { code: 'es', label: 'Español 🇪🇸' },
    { code: 'it', label: 'Italiano 🇮🇹' },
    { code: 'de', label: 'Deutsch 🇩🇪' },
  ];
  const NAV_CIBLES = ['', 'admissions', 'flotte', 'easa', 'cursus', 'ryanair', 'medical', 'employabilite'];

  let auth = sessionStorage.getItem('astonfly-admin-auth') || '';
  let categories = [];
  let articles = [];
  let evenements = [];
  let ongletActif = 'articles';

  /* ---------- HTTP ---------- */
  async function api(chemin, options = {}) {
    const reponse = await fetch(API + chemin, {
      ...options,
      headers: {
        Authorization: 'Basic ' + auth,
        ...(options.body && !(options.body instanceof FormData)
          ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    });
    if (reponse.status === 401) { deconnecter(); throw new Error('Session expirée'); }
    if (!reponse.ok) {
      let detail = 'Erreur ' + reponse.status;
      try { const j = await reponse.json(); detail = j.message || j.avertissement || detail; } catch (e) {}
      throw new Error(detail);
    }
    return reponse.status === 204 || options.sansCorps ? null : reponse.json().catch(() => null);
  }

  /* ---------- Connexion ---------- */
  async function connecter(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const mdp = document.getElementById('login-mdp').value;
    auth = btoa(email + ':' + mdp);
    try {
      await api('/admin/articles/ping');
      sessionStorage.setItem('astonfly-admin-auth', auth);
      document.getElementById('login').style.display = 'none';
      document.getElementById('app').classList.add('on');
      onglet('articles');
    } catch (err) {
      auth = '';
      document.getElementById('login-erreur').textContent = 'Identifiants incorrects';
    }
    return false;
  }

  function deconnecter() {
    auth = '';
    sessionStorage.removeItem('astonfly-admin-auth');
    document.getElementById('app').classList.remove('on');
    document.getElementById('login').style.display = 'flex';
  }

  async function demarrer() {
    if (!auth) return;
    try {
      await api('/admin/articles/ping');
      document.getElementById('login').style.display = 'none';
      document.getElementById('app').classList.add('on');
      onglet('articles');
    } catch (e) { deconnecter(); }
  }

  /* ---------- Utilitaires ---------- */
  const $ = (id) => document.getElementById(id);
  const contenu = () => $('contenu');
  const ech = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function message(texte, erreur = false) {
    const el = $('message');
    el.textContent = texte;
    el.className = 'on' + (erreur ? ' erreur' : '');
    clearTimeout(message._t);
    message._t = setTimeout(() => { el.className = ''; }, erreur ? 6000 : 3500);
  }

  function slugifier(texte) {
    return texte.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
  }

  function pastilleStatut(statut) {
    return statut === 'PUBLIE'
      ? '<span class="pastille p-publie">Publié</span>'
      : '<span class="pastille p-brouillon">Brouillon</span>';
  }

  async function chargerCategories() {
    categories = await api('/admin/categories');
  }

  async function uploader(fichier) {
    const forme = new FormData();
    forme.append('fichier', fichier);
    const r = await api('/admin/media', { method: 'POST', body: forme });
    return r.url;
  }

  function brancherUpload(idFichier, idUrl) {
    $(idFichier).addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        $(idUrl).value = await uploader(f);
        message('Image téléversée');
      } catch (err) { message(err.message, true); }
    });
  }

  function onglet(nom) {
    ongletActif = nom;
    ['articles', 'categories', 'evenements'].forEach((o) =>
      $('nav-' + o).classList.toggle('actif', o === nom));
    ({ articles: vueArticles, categories: vueCategories, evenements: vueEvenements })[nom]();
  }

  /* =============================================================
     ARTICLES
     ============================================================= */
  async function vueArticles() {
    contenu().innerHTML = '<div class="vide">Chargement…</div>';
    [articles] = await Promise.all([api('/admin/articles'), chargerCategories()]);
    contenu().innerHTML = `
      <div class="entete">
        <h1>Articles de blog</h1>
        <button class="btn btn-cyan" onclick="Admin.editerArticle(null)">+ Nouvel article</button>
      </div>
      <div class="carte">
        ${articles.length === 0 ? '<div class="vide">Aucun article pour le moment. Rédigez le premier !</div>' : `
        <table>
          <thead><tr><th>Article</th><th>Catégorie</th><th>Date</th><th>Langues</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            ${articles.map((a) => `
              <tr>
                <td style="font-weight:600">${ech(a.titre)}<div style="font-size:12px;color:var(--muted);font-weight:400">${ech(a.slug)}</div></td>
                <td>${ech(a.categorie)}</td>
                <td>${ech(a.datePublication)}</td>
                <td>${a.langues.map((l) => `<span class="pastille p-lang">${l.toUpperCase()}</span>`).join('')}</td>
                <td>${pastilleStatut(a.statut)}</td>
                <td class="actions-td">
                  <button class="btn btn-clair btn-petit" onclick="Admin.editerArticle(${a.id})">Modifier</button>
                  ${a.statut === 'PUBLIE'
                    ? `<button class="btn btn-clair btn-petit" onclick="Admin.basculerArticle(${a.id}, false)">Dépublier</button>`
                    : `<button class="btn btn-cyan btn-petit" onclick="Admin.basculerArticle(${a.id}, true)">Publier</button>`}
                  <button class="btn btn-danger btn-petit" onclick="Admin.supprimerArticle(${a.id})">Suppr.</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>`}
      </div>`;
  }

  async function basculerArticle(id, publier) {
    try {
      await api(`/admin/articles/${id}/${publier ? 'publier' : 'depublier'}`, { method: 'POST' });
      message(publier ? 'Article publié sur le site' : 'Article repassé en brouillon');
      vueArticles();
    } catch (e) { message(e.message, true); }
  }

  async function supprimerArticle(id) {
    if (!confirm('Supprimer définitivement cet article ?')) return;
    try {
      await api('/admin/articles/' + id, { method: 'DELETE', sansCorps: true });
      message('Article supprimé');
      vueArticles();
    } catch (e) { message(e.message, true); }
  }

  async function editerArticle(id) {
    await chargerCategories();
    if (categories.length === 0) {
      message('Créez d\'abord une catégorie (onglet Catégories)', true);
      return onglet('categories');
    }
    let article = null;
    if (id) article = await api('/admin/articles/' + id);
    const fr = article ? article.traductions.fr : null;
    const corps = fr ? fr.corps : [{ p: [''] }];
    const languesActives = article ? Object.keys(article.traductions).filter((l) => l !== 'fr') : [];

    contenu().innerHTML = `
      <div class="entete">
        <h1>${id ? 'Modifier l\'article' : 'Nouvel article'}</h1>
        <button class="btn btn-clair" onclick="Admin.onglet('articles')">← Retour</button>
      </div>
      <div class="carte">
        <label>Titre</label>
        <input type="text" id="a-titre" value="${ech(fr ? fr.titre : '')}" oninput="Admin.majSlug()">
        <div class="ligne">
          <div><label>Slug (URL)</label><input type="text" id="a-slug" value="${ech(article ? article.slug : '')}"></div>
          <div><label>Catégorie</label>
            <select id="a-categorie">
              ${categories.map((c) => `<option value="${c.id}" ${article && article.categorieId === c.id ? 'selected' : ''}>${ech(c.noms.fr)}</option>`).join('')}
            </select></div>
        </div>
        <div class="ligne">
          <div><label>Date de publication</label><input type="date" id="a-date" value="${article ? article.datePublication : new Date().toISOString().slice(0, 10)}"></div>
          <div><label>Temps de lecture (minutes)</label><input type="number" id="a-minutes" min="1" value="${article ? article.minutesLecture : 5}"></div>
        </div>
        <div class="ligne">
          <div><label>Image d'illustration</label><input type="text" id="a-image" placeholder="/images/… ou téléverser →" value="${ech(article ? article.image : '')}"></div>
          <div><label>Téléverser une image</label><input type="file" id="a-fichier" accept="image/*"></div>
        </div>
        <label>Texte alternatif de l'image</label>
        <input type="text" id="a-alt" value="${ech(fr ? fr.altImage : '')}">
        <label>Chapô (accroche affichée sous le titre)</label>
        <textarea id="a-chapo">${ech(fr ? fr.chapo : '')}</textarea>

        <label>Corps de l'article</label>
        <div class="note">Chaque section a un intertitre optionnel et des paragraphes (un paragraphe par ligne vide). Les blocs « bouton » créent un lien vers une page du site.</div>
        <div id="a-blocs"></div>
        <div style="margin-top:12px">
          <button class="btn btn-clair btn-petit" onclick="Admin.ajouterBloc('section')">+ Section</button>
          <button class="btn btn-clair btn-petit" onclick="Admin.ajouterBloc('cta')">+ Bouton (CTA)</button>
        </div>

        <label>Langues de publication</label>
        <div class="note">L'article est rédigé en français ; il sera traduit automatiquement vers les langues cochées et affiché sur ces versions du site.</div>
        <div class="langues">
          <label class="fixe">🇫🇷 Français (source)</label>
          ${LANGUES.map((l) => `<label><input type="checkbox" class="a-lang" value="${l.code}" ${languesActives.includes(l.code) ? 'checked' : ''}> ${l.label}</label>`).join('')}
        </div>

        <div style="display:flex;gap:12px;margin-top:28px">
          <button class="btn btn-clair" onclick="Admin.sauverArticle(${id ?? 'null'}, false)">Enregistrer en brouillon</button>
          <button class="btn btn-cyan" onclick="Admin.sauverArticle(${id ?? 'null'}, true)">Publier sur le site</button>
        </div>
      </div>`;

    brancherUpload('a-fichier', 'a-image');
    corps.forEach((bloc) => ajouterBloc(bloc.ctaLabel !== undefined ? 'cta' : 'section', bloc));
  }

  function majSlug() {
    const slug = $('a-slug');
    if (!slug.dataset.manuel) slug.value = slugifier($('a-titre').value);
  }

  function ajouterBloc(type, donnees) {
    const zone = $('a-blocs');
    const bloc = document.createElement('div');
    bloc.className = 'bloc';
    bloc.dataset.type = type;
    if (type === 'section') {
      bloc.innerHTML = `
        <label>Intertitre (optionnel)</label>
        <input type="text" class="b-h" value="${ech(donnees ? donnees.h || '' : '')}">
        <label>Paragraphes</label>
        <textarea class="b-p" rows="5">${ech(donnees && donnees.p ? donnees.p.join('\n\n') : '')}</textarea>
        <div class="outils"><button class="lien-outil" onclick="this.closest('.bloc').remove()">Supprimer le bloc</button></div>`;
    } else {
      bloc.innerHTML = `
        <label>Texte du bouton</label>
        <input type="text" class="b-cta-label" value="${ech(donnees ? donnees.ctaLabel || '' : '')}">
        <div class="ligne">
          <div><label>Page cible</label>
            <select class="b-cta-nav">${NAV_CIBLES.map((n) => `<option value="${n}" ${donnees && donnees.ctaNav === n ? 'selected' : ''}>${n || '(accueil)'}</option>`).join('')}</select></div>
          <div><label>Ancre (optionnel)</label><input type="text" class="b-cta-anchor" value="${ech(donnees ? donnees.ctaAnchor || '' : '')}"></div>
        </div>
        <div class="outils"><button class="lien-outil" onclick="this.closest('.bloc').remove()">Supprimer le bloc</button></div>`;
    }
    zone.appendChild(bloc);
  }

  function lireCorps() {
    return Array.from($('a-blocs').children).map((bloc) => {
      if (bloc.dataset.type === 'cta') {
        const b = { ctaLabel: bloc.querySelector('.b-cta-label').value.trim() };
        const nav = bloc.querySelector('.b-cta-nav').value;
        const anchor = bloc.querySelector('.b-cta-anchor').value.trim();
        if (nav) b.ctaNav = nav;
        if (anchor) b.ctaAnchor = anchor;
        return b;
      }
      const b = {};
      const h = bloc.querySelector('.b-h').value.trim();
      if (h) b.h = h;
      b.p = bloc.querySelector('.b-p').value.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
      return b;
    }).filter((b) => (b.p && b.p.length) || b.h || b.ctaLabel);
  }

  async function sauverArticle(id, publier) {
    const corps = lireCorps();
    const requete = {
      slug: $('a-slug').value.trim() || slugifier($('a-titre').value),
      categorieId: Number($('a-categorie').value),
      datePublication: $('a-date').value,
      minutesLecture: Number($('a-minutes').value) || 1,
      image: $('a-image').value.trim(),
      source: {
        titre: $('a-titre').value.trim(),
        chapo: $('a-chapo').value.trim(),
        altImage: $('a-alt').value.trim(),
        corps,
      },
      langues: Array.from(document.querySelectorAll('.a-lang:checked')).map((c) => c.value),
    };
    if (!requete.source.titre || !requete.image || !requete.source.chapo || !requete.source.altImage || corps.length === 0) {
      return message('Titre, image, alt, chapô et au moins un bloc de contenu sont requis', true);
    }
    try {
      message(requete.langues.length ? 'Enregistrement et traduction en cours…' : 'Enregistrement…');
      const r = await api(id ? '/admin/articles/' + id : '/admin/articles', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(requete),
      });
      if (publier) await api(`/admin/articles/${r.article.id}/publier`, { method: 'POST' });
      message(r.avertissement || (publier ? 'Article publié sur le site' : 'Brouillon enregistré'), !!r.avertissement);
      onglet('articles');
    } catch (e) { message(e.message, true); }
  }

  /* =============================================================
     CATÉGORIES
     ============================================================= */
  async function vueCategories() {
    contenu().innerHTML = '<div class="vide">Chargement…</div>';
    await chargerCategories();
    contenu().innerHTML = `
      <div class="entete"><h1>Catégories</h1></div>
      <div class="carte" style="margin-bottom:20px">
        <label>Nouvelle catégorie (nom français — traduit automatiquement dans les autres langues)</label>
        <div style="display:flex;gap:12px">
          <input type="text" id="c-nom" placeholder="Ex. Partenariat">
          <button class="btn btn-cyan" onclick="Admin.creerCategorie()">Ajouter</button>
        </div>
      </div>
      <div class="carte">
        ${categories.length === 0 ? '<div class="vide">Aucune catégorie.</div>' : `
        <table>
          <thead><tr><th>FR</th><th>EN</th><th>PT</th><th>ES</th><th>IT</th><th>DE</th><th></th></tr></thead>
          <tbody>
            ${categories.map((c) => `
              <tr>
                <td style="font-weight:600">${ech(c.noms.fr)}</td>
                <td>${ech(c.noms.en || '')}</td><td>${ech(c.noms.pt || '')}</td>
                <td>${ech(c.noms.es || '')}</td><td>${ech(c.noms.it || '')}</td><td>${ech(c.noms.de || '')}</td>
                <td class="actions-td">
                  <button class="btn btn-clair btn-petit" onclick="Admin.renommerCategorie(${c.id})">Renommer</button>
                  <button class="btn btn-danger btn-petit" onclick="Admin.supprimerCategorie(${c.id})">Suppr.</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>`}
      </div>`;
  }

  async function creerCategorie() {
    const nom = $('c-nom').value.trim();
    if (!nom) return;
    try {
      message('Création et traduction…');
      await api('/admin/categories', { method: 'POST', body: JSON.stringify({ nomFr: nom }) });
      message('Catégorie créée');
      vueCategories();
    } catch (e) { message(e.message, true); }
  }

  async function renommerCategorie(id) {
    const categorie = categories.find((c) => c.id === id);
    const nom = prompt('Nouveau nom (français) :', categorie.noms.fr);
    if (!nom || !nom.trim()) return;
    try {
      message('Mise à jour et traduction…');
      await api('/admin/categories/' + id, { method: 'PUT', body: JSON.stringify({ nomFr: nom.trim() }) });
      message('Catégorie mise à jour');
      vueCategories();
    } catch (e) { message(e.message, true); }
  }

  async function supprimerCategorie(id) {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await api('/admin/categories/' + id, { method: 'DELETE', sansCorps: true });
      message('Catégorie supprimée');
      vueCategories();
    } catch (e) { message(e.message, true); }
  }

  /* =============================================================
     ÉVÉNEMENTS
     ============================================================= */
  async function vueEvenements() {
    contenu().innerHTML = '<div class="vide">Chargement…</div>';
    evenements = await api('/admin/evenements');
    contenu().innerHTML = `
      <div class="entete">
        <h1>Événements</h1>
        <button class="btn btn-cyan" onclick="Admin.editerEvenement(null)">+ Nouvel événement</button>
      </div>
      <div class="carte">
        ${evenements.length === 0 ? '<div class="vide">Aucun événement. Tant qu\'aucun n\'est publié, le site affiche ses événements d\'exemple.</div>' : `
        <table>
          <thead><tr><th></th><th>Événement</th><th>Date</th><th>Lieu</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            ${evenements.map((e) => `
              <tr>
                <td><img class="apercu-img" src="${ech(e.image)}" alt=""></td>
                <td style="font-weight:600">${ech(e.titre)}<div style="font-size:12px;color:var(--muted);font-weight:400">${ech(e.tag)} · ${ech(e.horaire)}</div></td>
                <td>${ech(e.date)}</td>
                <td>${ech(e.lieu)}</td>
                <td>${pastilleStatut(e.statut)}</td>
                <td class="actions-td">
                  <button class="btn btn-clair btn-petit" onclick="Admin.editerEvenement(${e.id})">Modifier</button>
                  ${e.statut === 'PUBLIE'
                    ? `<button class="btn btn-clair btn-petit" onclick="Admin.basculerEvenement(${e.id}, false)">Retirer du site</button>`
                    : `<button class="btn btn-cyan btn-petit" onclick="Admin.basculerEvenement(${e.id}, true)">Publier</button>`}
                  <button class="btn btn-danger btn-petit" onclick="Admin.supprimerEvenement(${e.id})">Suppr.</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>`}
      </div>`;
  }

  function editerEvenement(id) {
    const e = id ? evenements.find((x) => x.id === id) : null;
    contenu().innerHTML = `
      <div class="entete">
        <h1>${id ? 'Modifier l\'événement' : 'Nouvel événement'}</h1>
        <button class="btn btn-clair" onclick="Admin.onglet('evenements')">← Retour</button>
      </div>
      <div class="carte">
        <div class="note">Mêmes informations que les cartes de la section « Événements » du site : la date donne le jour et le mois affichés, le tag est l'étiquette (Portes ouvertes, Webinaire, Salon…). Le contenu est saisi en français et traduit automatiquement dans les 5 autres langues.</div>
        <div class="ligne">
          <div><label>Date</label><input type="date" id="e-date" value="${e ? e.date : ''}"></div>
          <div><label>Tag</label><input type="text" id="e-tag" placeholder="Portes ouvertes / Webinaire / Salon" value="${ech(e ? e.tag : '')}"></div>
        </div>
        <label>Titre</label>
        <input type="text" id="e-titre" placeholder="Journée Portes Ouvertes" value="${ech(e ? e.titre : '')}">
        <div class="ligne">
          <div><label>Lieu</label><input type="text" id="e-lieu" placeholder="Campus de Paris - Toussus-le-Noble" value="${ech(e ? e.lieu : '')}"></div>
          <div><label>Horaire</label><input type="text" id="e-horaire" placeholder="10h – 17h / Journée / 18h30" value="${ech(e ? e.horaire : '')}"></div>
        </div>
        <label>Description</label>
        <textarea id="e-desc" placeholder="Visite du campus, simulateurs et rencontres avec les équipes.">${ech(e ? e.description : '')}</textarea>
        <div class="ligne">
          <div><label>Image</label><input type="text" id="e-image" placeholder="/images/… ou téléverser →" value="${ech(e ? e.image : '')}"></div>
          <div><label>Téléverser une image</label><input type="file" id="e-fichier" accept="image/*"></div>
        </div>
        <div style="display:flex;gap:12px;margin-top:28px">
          <button class="btn btn-clair" onclick="Admin.sauverEvenement(${id ?? 'null'}, false)">Enregistrer en brouillon</button>
          <button class="btn btn-cyan" onclick="Admin.sauverEvenement(${id ?? 'null'}, true)">Ajouter l'événement sur le site</button>
        </div>
      </div>`;
    brancherUpload('e-fichier', 'e-image');
  }

  async function sauverEvenement(id, publier) {
    const requete = {
      date: $('e-date').value,
      tag: $('e-tag').value.trim(),
      titre: $('e-titre').value.trim(),
      lieu: $('e-lieu').value.trim(),
      horaire: $('e-horaire').value.trim(),
      description: $('e-desc').value.trim(),
      image: $('e-image').value.trim(),
    };
    if (!requete.date || !requete.tag || !requete.titre || !requete.lieu || !requete.horaire
        || !requete.description || !requete.image) {
      return message('Tous les champs sont requis', true);
    }
    try {
      message('Enregistrement et traduction en cours…');
      const r = await api(id ? '/admin/evenements/' + id : '/admin/evenements', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(requete),
      });
      if (publier) await api(`/admin/evenements/${r.id}/publier`, { method: 'POST' });
      message(r.avertissement || (publier ? 'Événement publié sur le site' : 'Brouillon enregistré'), !!r.avertissement);
      onglet('evenements');
    } catch (e) { message(e.message, true); }
  }

  async function basculerEvenement(id, publier) {
    try {
      await api(`/admin/evenements/${id}/${publier ? 'publier' : 'depublier'}`, { method: 'POST' });
      message(publier ? 'Événement publié sur le site' : 'Événement retiré du site');
      vueEvenements();
    } catch (e) { message(e.message, true); }
  }

  async function supprimerEvenement(id) {
    if (!confirm('Supprimer définitivement cet événement ?')) return;
    try {
      await api('/admin/evenements/' + id, { method: 'DELETE', sansCorps: true });
      message('Événement supprimé');
      vueEvenements();
    } catch (e) { message(e.message, true); }
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const slug = document.body; // délégation : slug modifié à la main → ne plus l'écraser
    slug.addEventListener('input', (e) => {
      if (e.target.id === 'a-slug') e.target.dataset.manuel = '1';
    });
    demarrer();
  });

  return {
    connecter, deconnecter, onglet, majSlug, ajouterBloc,
    editerArticle, sauverArticle, basculerArticle, supprimerArticle,
    creerCategorie, renommerCategorie, supprimerCategorie,
    editerEvenement, sauverEvenement, basculerEvenement, supprimerEvenement,
  };
})();
