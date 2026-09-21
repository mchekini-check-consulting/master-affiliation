import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Buildings as Building2, CaretDown as ChevronDown, Headphones, Bank as Landmark, List as Menu, Phone, X } from '@phosphor-icons/react';
import PrimaryButton from '@/components/ui/primary-button';
import TopBar from '@/components/TopBar';
import LogoMark from '@/components/LogoMark';
import { formations } from '@/data/formations';
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
// Le bandeau utilitaire est dans le FLUX NORMAL : il defile avec la page et
// disparait en haut. Seule la capsule est fixe. Tant que le bandeau est encore
// visible, la capsule est decalee vers le bas de ce qu'il en reste, puis elle
// se colle au bord superieur. Sans ce decalage, elle recouvrirait le bandeau
// des le chargement.
const BARRE_H = 36;
const CAPSULE_PT = 'pt-3 sm:pt-4';
const CAPSULE_W = 'mx-auto w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-site';
const PHONE = { label: '07 51 47 41 35', href: 'tel:+33751474135' };

// La signature de marque : trois mots, un par ligne, à droite du filet. Ils
// tiennent lieu de baseline et donnent au lockup sa masse. Des NOMS et non des
// verbes : un verbe promet, un nom affirme — c'est ce qui sépare un slogan
// d'organisme de formation d'une devise d'école.
const SIGNATURE = ['Exigence', 'Terrain', 'Résultat'];

const navItems = [
  { label: 'Formations', panelId: 'formations' },
  { label: 'Financements', panelId: 'financements' },
  { label: 'Blog', href: '/blog' },
  { label: 'À propos', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

const menuPanels = {
  formations: {
    titre: 'Notre catalogue',
    sousTitre: 'Des formations courtes, en classe virtuelle, éligibles au financement OPCO.',
    footer: { label: 'Voir tout le catalogue', href: '/formations' },
    items: formations.map((f) => ({
      title: f.title,
      description: f.tag,
      imageSrc: f.image,
      href: `/formations/${f.id}`,
    })),
  },
  financements: {
    titre: 'Financer votre formation',
    sousTitre: 'Les dispositifs mobilisables et à qui vous adresser.',
    footer: { label: 'Tout savoir sur le financement', href: '/financements' },
    items: [
      { icon: Building2, title: 'Les OPCO, vos financeurs', description: 'Les Opérateurs de Compétences financent les actions de formation des entreprises, en priorité les TPE/PME.', href: '/financements' },
      { icon: Landmark, title: 'France compétences', description: 'Le régulateur qui finance et contrôle le système de formation professionnelle.', href: '/financements' },
      { icon: Headphones, title: 'Être accompagné', description: 'Parlez à un conseiller de votre projet et de son financement.', href: '/#contact' },
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
    <Link to="/" className="flex items-center gap-4 shrink-0" aria-label="Hi Tech Academy, accueil">
      <LogoMark size={54} rotate={-7} className="shrink-0" style={{ color: NAVY }} />
      {/* Filet de séparation : un trait plein à la hauteur de l'emblème, pas un
          `border` de 1 px qui disparaîtrait. C'est lui qui fait tenir le lockup
          ensemble, donc il est dans la couleur de la marque, pas en gris. */}
      <span aria-hidden="true" className="shrink-0 w-px h-[52px]" style={{ background: NAVY }} />
      {/* Les trois mots de la marque, empilés à la hauteur exacte de l'emblème :
          trois lignes de 12 px en interligne 1,45 remplissent les 52 px du
          filet. Le nom complet reste porté par l'`aria-label` du lien. */}
      <span aria-hidden="true" className="flex flex-col justify-between h-[52px] py-px">
        {SIGNATURE.map((mot) => (
          <span
            key={mot}
            className="text-caption font-bold uppercase leading-none whitespace-nowrap"
            style={{ color: NAVY, letterSpacing: '0.18em', ...serifFont }}>
            {mot}
          </span>
        ))}
      </span>
    </Link>
  );
}

/** Carte illustrée du méga-menu (formations). */
function ImageCard({ item, onNavigate }) {
  return (
    <NavLink
      href={item.href}
      onClick={onNavigate}
      className="group relative flex h-[160px] flex-col justify-end overflow-hidden p-4"
      style={{ borderRadius: RADIUS, border: `1px solid ${LINE}` }}>
      <img
        src={item.imageSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(0,12,91,0.10) 35%, rgba(0,12,91,0.92) 100%)' }} />
      <span className="relative text-caption font-semibold uppercase tracking-[0.12em]" style={{ color: '#9cbdff', ...bodyFont }}>
        {item.description}
      </span>
      <span className="relative mt-1 flex items-center gap-2 text-body-base font-semibold text-white" style={headingFont}>
        {item.title}
        <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
      </span>
    </NavLink>
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
    ? (() => {
        const [first, second, ...rest] = panel.items;
        return (
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-4">
            <ImageCard item={first} onNavigate={onNavigate} />
            <ImageCard item={second} onNavigate={onNavigate} />
            {/* Les formations suivantes en lignes compactes : trois lignes de
                48 px + deux gouttières de 8 px retombent exactement sur la
                hauteur des deux cartes illustrées (160 px). */}
            <div className="grid gap-2 content-start">
              {rest.slice(0, 3).map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className="group flex items-center justify-between gap-3 h-12 px-4 transition-colors hover:bg-[#dbebff]"
                  style={{ borderRadius: RADIUS, border: `1px solid ${LINE}`, background: MINT_LIGHT }}>
                  <span className="min-w-0">
                    <span className="block truncate text-body-sm font-semibold leading-tight" style={{ color: BODY, ...headingFont }}>
                      {item.title}
                    </span>
                    <span className="block truncate text-caption leading-tight mt-0.5" style={{ color: BODY_MUTED, ...bodyFont }}>
                      {item.description}
                    </span>
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: TEAL }} />
                </NavLink>
              ))}
            </div>
          </div>
        );
      })()
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
        <NavLink
          href={panel.footer.href}
          onClick={onNavigate}
          className="group inline-flex items-center gap-2 h-11 px-5 rounded-full text-body-sm font-semibold transition-colors hover:bg-[#dbebff]"
          style={{ background: MINT_LIGHT, color: NAVY, border: `1px solid ${LINE}`, ...headingFont }}>
          {panel.footer.label}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </NavLink>
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

  const [decalage, setDecalage] = useState(BARRE_H);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      setDecalage(Math.max(0, BARRE_H - window.scrollY));
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
      {/* Flux normal : il defile et ne revient pas. */}
      <TopBar />

      <header
        ref={headerRef}
        className="fixed inset-x-0 z-50 pointer-events-none"
        style={{ top: decalage }}>
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
          boxShadow: scrolled ? '0 10px 16px -10px rgba(0,12,91,0.26)' : '0 8px 12px -10px rgba(0,12,91,0.20)',
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
            style={{ background: '#ffffff', borderRadius: 24, border: `1px solid ${LINE}`, boxShadow: '0 18px 40px -20px rgba(0,12,91,.28)' }}>
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
            style={{ background: '#ffffff', borderRadius: 24, border: `1px solid ${LINE}`, boxShadow: '0 18px 40px -20px rgba(0,12,91,.28)' }}>
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
