import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Buildings as Building2, CaretDown as ChevronDown, Headphones, Bank as Landmark, List as Menu, Phone, X } from '@phosphor-icons/react';
import PrimaryButton from '@/components/ui/primary-button';
import LogoMark from '@/components/LogoMark';
import { formations } from '@/data/formations';
import { categories } from '@/data/categories';
import { NAVY, TEAL, LINE, MINT_LIGHT, BODY, BODY_MUTED, headingFont, bodyFont, serifFont } from '@/components/design';

// Barre de navigation du site public : une CAPSULE BLANCHE flottante.
//
//  · Capsule en pilule, fond blanc plein, posée à 12/16 px du haut de la
//    fenêtre, qui flotte au-dessus du contenu. Le `<header>` lui-même est
//    transparent et en `pointer-events: none` : seule la capsule et ses
//    panneaux captent la souris, le reste de la bande laisse passer les clics.
//  · Largeur `max-w-site` (1448 px) et padding interne de 24 px : le logo
//    tombe AU PIXEL sur la verticale du contenu des sections, qui utilisent le
//    même couple `max-w-site` + `px-6`. En dessous de cette largeur, la
//    capsule garde 24 px de marge latérale — sinon ce n'est plus une capsule
//    mais une barre collée aux bords.
//  · Méga-menu et panneau mobile : deux surfaces DISTINCTES posées 12 px sous
//    la capsule, en rayon 24. Elles ne s'y raccordent pas, ce qui évite
//    d'aplatir les coins de la pilule à l'ouverture.
//  · Hauteur 64 px (mobile) / 72 px (desktop) = cible tactile de 44 px + 14 px
//    de part et d'autre. Toutes les cibles cliquables font 44 px minimum.
//  · Aucune opacité sur du blanc ni sur du texte (règle de la charte).
//
// La capsule est TOUJOURS blanche : il n'y a plus de variante claire sur fond
// sombre. Le héro marine passe derrière elle et la détache, ce qui rend le
// basculement de couleurs inutile. `embedded` est conservé pour ne casser
// aucun appel (`<Header embedded />` sur l'accueil) mais ne change plus rien.

const RADIUS = 8;
const BAR_H = 'h-16 lg:h-[72px]';
// Retrait de la capsule par rapport au haut de la fenêtre, et son gabarit.
// `CAPSULE_PT` + hauteur de barre = la hauteur totale occupée par le header,
// reprise par `HEADER_OFFSET` dans les pages qui collent un élément dessous.
const CAPSULE_PT = 'pt-3 sm:pt-4';
const CAPSULE_W = 'mx-auto w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-site';
const PHONE = { label: '07 51 47 41 35', href: 'tel:+33751474135' };

const navItems = [
  { label: 'Formations', panelId: 'formations' },
  { label: 'Financements', panelId: 'financements' },
  { label: 'Blog', href: '/blog' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Contact', href: '/contact' },
];

const menuPanels = {
  formations: {
    titre: 'Notre catalogue',
    sousTitre: 'Des formations courtes, en classe virtuelle, éligibles au financement OPCO.',
    footer: { label: 'Voir tout le catalogue', href: '/formations' },
    items: categories.map((c) => ({
      title: c.tag,
      description: `${c.formations.length} formation${c.formations.length > 1 ? 's' : ''}`,
      texte: c.description,
      icon: c.icon,
      href: `/formations?categorie=${c.slug}`,
    })),
  },
  financements: {
    titre: 'Financer votre formation',
    sousTitre: 'Les dispositifs mobilisables et à qui vous adresser.',
    footer: { label: 'Tout savoir sur le financement', href: '/financements' },
    items: [
      { icon: Building2, title: 'Les OPCO, vos financeurs', description: 'Les Opérateurs de Compétences financent les actions de formation des entreprises, en priorité les TPE/PME.', href: '/financements' },
      { icon: Landmark, title: 'France compétences', description: 'Le régulateur qui finance et contrôle le système de formation professionnelle.', href: '/financements' },
      { icon: Headphones, title: 'Être accompagné', description: 'Parlez à un conseiller de votre projet et de son financement.', href: '/contact?mode=rendez-vous' },
    ],
  },
};

/** Lien interne (react-router) ou ancre (/#section) selon la cible. */
function NavLink({ href, children, ...props }) {
  if (href.includes('#')) return <a href={href} {...props}>{children}</a>;
  return <Link to={href} {...props}>{children}</Link>;
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="Hi Tech Academy, accueil">
      <LogoMark size={40} className="shrink-0" style={{ color: NAVY }} />
      {/* Nom de la marque en toutes lettres, à côté de l'emblème. Le nom
          complet reste porté par l'`aria-label` du lien. */}
      <span
        aria-hidden="true"
        className="whitespace-nowrap text-[20px] font-semibold leading-none"
        style={{ color: '#243037', letterSpacing: '-0.015em', ...serifFont }}>
        Hi Tech Academy
      </span>
    </Link>
  );
}

/**
 * Carte de catégorie du méga-menu. Au survol : bordure marine, fond pâle,
 * la pastille d'icône passe du marine au bleu vif et se soulève d'un cran,
 * la flèche glisse. Tout reste dans la charte (aplats, pas de dégradé).
 */
function CategoryCard({ item, index, onNavigate }) {
  const Icon = item.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.04 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}>
      <NavLink
        href={item.href}
        onClick={onNavigate}
        className="mega-cat group flex h-full flex-col p-6 bg-white"
        style={{ borderRadius: RADIUS }}>
        <span className="flex items-start justify-between gap-3">
          <span className="mega-cat__icon grid place-items-center w-12 h-12 shrink-0 text-white" style={{ borderRadius: RADIUS }}>
            <Icon size={24} weight="duotone" />
          </span>
          <span className="mega-cat__count text-caption font-semibold px-2.5 py-1 rounded-full" style={{ color: NAVY, ...headingFont }}>
            {item.description}
          </span>
        </span>
        <span className="block text-h4 font-semibold leading-snug mt-6" style={{ color: BODY, ...serifFont }}>
          {item.title}
        </span>
        <span className="block text-body-sm leading-[1.5] mt-2 flex-1" style={{ color: BODY_MUTED, ...bodyFont }}>
          {item.texte}
        </span>
        <span className="inline-flex items-center gap-2 mt-5 text-body-sm font-semibold" style={{ color: NAVY, ...headingFont }}>
          Voir les formations
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </NavLink>
    </motion.div>
  );
}

/** Dernière carte : tout le catalogue, sur l'aplat marine. */
function CatalogueCard({ index, onNavigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.04 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}>
      <NavLink
        href="/formations"
        onClick={onNavigate}
        className="group flex h-full flex-col justify-between p-6 transition-colors duration-300 bg-[#002d74] hover:bg-[#011f55]"
        style={{ borderRadius: RADIUS }}>
        <span>
          <span className="block text-caption font-semibold" style={{ color: '#9cbdff', ...headingFont }}>Catalogue complet</span>
          <span className="block text-h3 font-semibold leading-tight mt-3 text-white" style={serifFont}>
            {formations.length} formations certifiées Qualiopi
          </span>
          <span className="block text-body-sm leading-[1.5] mt-2" style={{ color: '#dbebff', ...bodyFont }}>
            En direct, 100 % à distance, finançables par votre OPCO.
          </span>
        </span>
        <span className="flex items-center justify-between mt-6">
          <span className="text-body-sm font-semibold text-white" style={headingFont}>Tout le catalogue</span>
          <span className="grid place-items-center w-11 h-11 rounded-full bg-white transition-transform duration-300 group-hover:translate-x-1">
            <ArrowRight className="w-4 h-4" style={{ color: NAVY }} />
          </span>
        </span>
      </NavLink>
    </motion.div>
  );
}

/** Carte texte du méga-menu (rubriques financement). */
function TextCard({ item, onNavigate }) {
  const Icon = item.icon;
  return (
    <NavLink
      href={item.href}
      onClick={onNavigate}
      className="group flex flex-col justify-center p-5 transition-colors hover:bg-[#dbebff]"
      style={{ borderRadius: RADIUS, border: `1px solid ${LINE}`, background: MINT_LIGHT }}>
      {Icon && (
        <span
          className="mb-3 flex w-10 h-10 items-center justify-center"
          style={{ borderRadius: RADIUS, background: '#ffffff', border: `1px solid ${LINE}` }}>
          <Icon className="w-[18px] h-[18px]" style={{ color: TEAL }} />
        </span>
      )}
      <span className="block text-body-base font-semibold leading-snug" style={{ color: BODY, ...headingFont }}>
        {item.title}
      </span>
      <span className="block text-body-sm leading-[1.5] mt-1" style={{ color: BODY_MUTED, ...bodyFont }}>
        {item.description}
      </span>
    </NavLink>
  );
}

/** Contenu du méga-menu : titre de rubrique + grille + lien de bas de panneau. */
function DropdownPanel({ panelId, onNavigate }) {
  const panel = menuPanels[panelId];

  const grid = panelId === 'formations'
    ? (
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${panel.items.length}, minmax(0, 1fr)) minmax(0, 1.1fr)` }}>
        {panel.items.map((item, i) => <CategoryCard key={item.href} item={item} index={i} onNavigate={onNavigate} />)}
        <CatalogueCard index={panel.items.length} onNavigate={onNavigate} />
      </div>
    )
    : (
      <div className="grid grid-cols-3 gap-4">
        {panel.items.map((item) => <TextCard key={item.title} item={item} onNavigate={onNavigate} />)}
      </div>
    );

  return (
    <div className="px-6 py-7">
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
        <div>
          <h2 className="text-h4 font-bold" style={{ color: BODY, ...headingFont }}>{panel.titre}</h2>
          <p className="text-body-sm mt-1" style={{ color: BODY_MUTED, ...bodyFont }}>{panel.sousTitre}</p>
        </div>
        {panelId !== 'formations' && <NavLink
          href={panel.footer.href}
          onClick={onNavigate}
          className="group inline-flex items-center gap-2 h-11 px-5 rounded-full text-body-sm font-semibold transition-colors hover:bg-[#dbebff]"
          style={{ background: MINT_LIGHT, color: NAVY, border: `1px solid ${LINE}`, ...headingFont }}>
          {panel.footer.label}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </NavLink>}
      </div>
      {grid}
    </div>
  );
}

// `embedded` n'a plus d'effet (voir l'en-tête du fichier) mais reste accepté
// pour que `<Header embedded />` de la page d'accueil continue de fonctionner.
export default function Header({ embedded: _embedded = false }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileActiveMenu, setMobileActiveMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
  const location = useLocation();

  const closeAll = () => {
    setActiveMenu(null);
    setMobileOpen(false);
    setMobileActiveMenu(null);
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Ferme les menus au changement de page
  useEffect(closeAll, [location.pathname, location.hash]);

  // Ferme le panneau desktop au clic extérieur ou sur Échap
  useEffect(() => {
    if (!activeMenu) return undefined;
    const onClick = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setActiveMenu(null);
    };
    const onKey = (e) => e.key === 'Escape' && setActiveMenu(null);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [activeMenu]);

  const toggleMenu = (id) => setActiveMenu(activeMenu === id ? null : id);

  return (
    <>
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-50 pointer-events-none">
        <div className={CAPSULE_PT}>

      {/* ── capsule blanche ──
          Largeur : `max-w-site` (1448 px = 1400 utiles + 2 × 24). Son padding
          interne de 24 px place le logo EXACTEMENT sur la verticale du contenu
          des sections, qui utilisent le même couple `max-w-site` + `px-6`.
          En dessous, `w-[calc(100%-3rem)]` lui garde 24 px de marge de chaque
          côté pour qu'elle reste une capsule et non une barre collée aux bords. */}
      <div
        className={`${CAPSULE_W} rounded-full transition-shadow duration-300 pointer-events-auto`}
        style={{
          background: '#ffffff',
          border: `1px solid ${LINE}`,
          // Spread négatif proche du flou : l'ombre reste inset sur les côtés et
          // en haut (quasi invisible), le décalage vertical la fait déborder
          // seulement en dessous — jamais un halo qui déborde de la capsule.
          boxShadow: scrolled ? '0 10px 16px -10px rgba(0,45,116,0.26)' : '0 8px 12px -10px rgba(0,45,116,0.20)',
        }}>
        <div className={`${BAR_H} flex items-center justify-between gap-6 xl:gap-10 px-4 sm:px-6`}>
          <Logo />

          {/* navigation desktop */}
          <nav className="hidden lg:flex items-center gap-1" style={headingFont}>
            {navItems.map((item) => {
              const ouvert = activeMenu === item.panelId;
              const classes = 'inline-flex items-center gap-1.5 h-11 px-4 rounded-full text-body-base font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#002d74]';
              return item.panelId ? (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => toggleMenu(item.panelId)}
                  aria-expanded={ouvert}
                  className={`${classes} cursor-pointer`}
                  style={ouvert
                    ? { background: NAVY, color: '#ffffff' }
                    : { background: 'transparent', color: BODY }}>
                  {item.label}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${ouvert ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <NavLink
                  key={item.label}
                  href={item.href}
                  className={`${classes} hover:bg-[#f0f7ff]`}
                  style={{ color: BODY }}>
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* actions desktop */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <a
              href={PHONE.href}
              aria-label={`Appeler le ${PHONE.label}`}
              title={PHONE.label}
              className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-4 text-body-sm font-semibold transition-colors min-[1280px]:px-5"
              style={{ background: '#ffffff', border: `1px solid ${LINE}`, color: BODY, ...headingFont }}>
              <Phone className="w-4 h-4 shrink-0" style={{ color: TEAL }} />
              <span className="hidden whitespace-nowrap min-[1280px]:inline">{PHONE.label}</span>
            </a>
            <PrimaryButton to="/formations" size="sm">S&apos;inscrire</PrimaryButton>
          </div>

          {/* bascule mobile — cible de 44 px */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex w-11 h-11 items-center justify-center shrink-0"
            style={{ borderRadius: RADIUS, border: `1px solid ${LINE}`, color: BODY }}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── méga-menu desktop ──
          Panneau distinct posé sous la capsule, même largeur, même centrage.
          Il ne s'y raccorde pas : deux surfaces séparées par 12 px, ce qui
          évite d'avoir à aplatir les coins de la capsule à l'ouverture. */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`hidden lg:block ${CAPSULE_W} mt-3 overflow-hidden pointer-events-auto`}
            style={{ background: '#ffffff', borderRadius: 24, border: `1px solid ${LINE}`, boxShadow: '0 18px 40px -20px rgba(0,45,116,.28)' }}>
            <DropdownPanel panelId={activeMenu} onNavigate={closeAll} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── panneau mobile ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`lg:hidden ${CAPSULE_W} mt-3 overflow-hidden pointer-events-auto`}
            style={{ background: '#ffffff', borderRadius: 24, border: `1px solid ${LINE}`, boxShadow: '0 18px 40px -20px rgba(0,45,116,.28)' }}>
            <div className="max-h-[calc(100dvh-120px)] overflow-y-auto px-5 py-4" style={headingFont}>
              {navItems.map((item) => {
                if (!item.panelId) {
                  return (
                    <NavLink
                      key={item.label}
                      href={item.href}
                      onClick={closeAll}
                      className="flex items-center min-h-[52px] py-3 text-body-base font-medium"
                      style={{ color: BODY, borderBottom: `1px solid ${LINE}` }}>
                      {item.label}
                    </NavLink>
                  );
                }

                const panel = menuPanels[item.panelId];
                const ouvert = mobileActiveMenu === item.panelId;
                return (
                  <div key={item.label} style={{ borderBottom: `1px solid ${LINE}` }}>
                    <button
                      type="button"
                      onClick={() => setMobileActiveMenu(ouvert ? null : item.panelId)}
                      aria-expanded={ouvert}
                      className="flex w-full items-center justify-between min-h-[52px] py-3 text-left text-body-base font-medium"
                      style={{ color: BODY }}>
                      {item.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${ouvert ? 'rotate-180' : ''}`} style={{ color: TEAL }} />
                    </button>
                    <AnimatePresence initial={false}>
                      {ouvert && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden">
                          <div className="grid pb-3 pl-4" style={{ borderLeft: `2px solid ${LINE}` }}>
                            {[...panel.items, { title: panel.footer.label, href: panel.footer.href }].map((panelItem) => (
                              <NavLink
                                key={panelItem.title}
                                href={panelItem.href}
                                onClick={closeAll}
                                className="block min-h-[44px] py-2">
                                <span className="block text-body-base font-medium leading-snug" style={{ color: BODY }}>
                                  {panelItem.title}
                                </span>
                                {panelItem.description && (
                                  <span className="block text-body-sm leading-snug mt-0.5" style={{ color: BODY_MUTED, ...bodyFont }}>
                                    {panelItem.description}
                                  </span>
                                )}
                              </NavLink>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              <div className="grid gap-3 pt-6">
                <PrimaryButton to="/formations" onClick={closeAll} className="w-full justify-start">
                  S&apos;inscrire
                </PrimaryButton>
                <a
                  href={PHONE.href}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full text-body-base font-semibold"
                  style={{ border: `1px solid ${LINE}`, color: BODY, ...headingFont }}>
                  <Phone className="w-4 h-4" style={{ color: TEAL }} /> {PHONE.label}
                </a>
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
        </div>
      </header>
    </>
  );
}
