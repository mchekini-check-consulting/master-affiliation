import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieIllustration from '@/components/CookieIllustration';
import { openCookieSettings } from '@/lib/cookieConsent';

// Page d'information exigée par l'article 82 de la loi Informatique et
// Libertés : ce qui est déposé, pourquoi, combien de temps, et comment
// revenir sur son choix. Le bouton de réglages rouvre le panneau du bandeau.

const TABLE = [
  {
    name: 'hta.auth',
    category: 'Strictement nécessaire',
    purpose: "Maintenir la session de l'apprenant connecté à son espace.",
    duration: "Fermeture de l'onglet",
  },
  {
    name: 'sidebar_state',
    category: 'Strictement nécessaire',
    purpose: "Mémoriser si le menu latéral de l'espace est ouvert ou replié.",
    duration: '7 jours',
  },
  {
    name: 'hta.cookie-consent.v1',
    category: 'Strictement nécessaire',
    purpose: 'Conserver votre choix afin de ne pas vous redemander à chaque visite.',
    duration: '6 mois',
  },
  {
    name: "Mesure d'audience",
    category: "Mesure d'audience",
    purpose: 'Compter les visites et comprendre quelles pages de formation sont consultées.',
    duration: '13 mois maximum',
  },
  {
    name: 'Publicité et réseaux sociaux',
    category: 'Publicité',
    purpose: "Mesurer l'efficacité de nos campagnes et limiter la répétition des annonces.",
    duration: '13 mois maximum',
  },
];

const SECTIONS = [
  {
    title: "1. Qu'est-ce qu'un cookie",
    body: [
      "Un cookie est un petit fichier déposé sur votre appareil lorsque vous consultez un site. Il permet de vous reconnaître d'une page à l'autre, de garder votre session ouverte, ou de mesurer la fréquentation du site. Nous employons ce terme au sens large : il couvre aussi les technologies équivalentes comme le stockage local du navigateur.",
    ],
  },
  {
    title: '2. Les cookies déposés sans votre accord',
    body: [
      "Certains cookies sont indispensables au fonctionnement du site : ils gardent votre session ouverte pendant une inscription, retiennent l'état de votre interface et conservent votre choix en matière de cookies. La réglementation les dispense de consentement, car le service ne peut pas être rendu sans eux. Ils ne servent à aucune mesure ni à aucune publicité.",
    ],
  },
  {
    title: '3. Les cookies soumis à votre accord',
    body: [
      "La mesure d'audience nous indique combien de personnes consultent le site et quelles formations retiennent l'attention. Les cookies publicitaires nous permettent de savoir si une campagne a bien amené des candidats vers nos formations, et d'éviter de vous montrer plusieurs fois la même annonce.",
      "Aucun de ces cookies n'est déposé avant votre acceptation. Tant que vous n'avez pas choisi, ou si vous refusez, aucun script de mesure ni de publicité n'est chargé.",
    ],
  },
  {
    title: '4. Modifier votre choix',
    body: [
      "Vous pouvez revenir sur votre décision à tout moment, via le bouton ci-dessous ou le lien « Gestion des cookies » présent en pied de page. Refuser est aussi simple qu'accepter et n'a aucune conséquence sur votre accès aux formations. Votre choix est conservé six mois, après quoi la question vous est posée à nouveau.",
      "Vous pouvez également configurer votre navigateur pour bloquer les cookies. Dans ce cas, certaines fonctions du site comme l'espace apprenant risquent de ne plus fonctionner.",
    ],
  },
  {
    title: '5. Vos droits',
    body: [
      "Conformément au règlement général sur la protection des données, vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition sur les données vous concernant. Pour l'exercer, écrivez à contact@hi-techacademy.fr. Vous pouvez aussi introduire une réclamation auprès de la CNIL. Le détail des traitements figure dans notre politique de confidentialité.",
    ],
  },
];

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 mb-8">
            <CookieIllustration size={52} />
            <h1
              className="text-3xl sm:text-4xl font-bold"
              style={{ color: '#243037', fontFamily: "'Inter', sans-serif" }}
            >
              Politique de cookies
            </h1>
          </div>

          <div
            className="space-y-8 text-sm leading-relaxed"
            style={{ color: '#5f6568', fontFamily: "'Inter', sans-serif" }}
          >
            {SECTIONS.slice(0, 3).map((section) => (
              <section key={section.title}>
                <h2
                  className="text-lg font-semibold mb-3"
                  style={{ color: '#002d74', fontFamily: "'Inter', sans-serif" }}
                >
                  {section.title}
                </h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="mb-2">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}

            <section>
              <h2
                className="text-lg font-semibold mb-3"
                style={{ color: '#002d74', fontFamily: "'Inter', sans-serif" }}
              >
                Détail des cookies
              </h2>
              {/* Le tableau garde sa largeur propre et défile seul sur mobile. */}
              <div className="overflow-x-auto" style={{ border: '1px solid #dbebff', borderRadius: 12 }}>
                <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 560 }}>
                  <thead>
                    <tr style={{ background: '#f0f7ff' }}>
                      {['Cookie', 'Catégorie', 'Finalité', 'Durée'].map((head) => (
                        <th
                          key={head}
                          className="text-left"
                          style={{
                            padding: '12px 16px',
                            color: '#002d74',
                            fontSize: 13,
                            fontWeight: 600,
                            borderBottom: '1px solid #dbebff',
                          }}
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TABLE.map((row) => (
                      <tr key={row.name}>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dbebff', color: '#243037', fontWeight: 500 }}>
                          {row.name}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dbebff' }}>{row.category}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dbebff' }}>{row.purpose}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #dbebff' }}>{row.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {SECTIONS.slice(3).map((section) => (
              <section key={section.title}>
                <h2
                  className="text-lg font-semibold mb-3"
                  style={{ color: '#002d74', fontFamily: "'Inter', sans-serif" }}
                >
                  {section.title}
                </h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="mb-2">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 16,
                padding: 24,
                borderRadius: 16,
                border: '1px solid #dbebff',
                background: '#f0f7ff',
              }}
            >
              <div style={{ flex: '1 1 260px' }}>
                <p style={{ margin: 0, color: '#002d74', fontSize: 15, fontWeight: 600 }}>
                  Revoir vos préférences
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 13 }}>
                  Le panneau s'ouvre avec vos choix actuels, vous pouvez les modifier en un clic.
                </p>
              </div>
              <button
                type="button"
                onClick={openCookieSettings}
                style={{
                  height: 44,
                  padding: '0 22px',
                  borderRadius: 9999,
                  border: '1px solid #002d74',
                  background: '#002d74',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Gérer mes cookies
              </button>
            </div>

            <p style={{ fontSize: 13 }}>Dernière mise à jour : 21 septembre 2026.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
