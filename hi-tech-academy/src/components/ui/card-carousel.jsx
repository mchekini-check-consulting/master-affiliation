import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, EffectCoverflow, Navigation, Pagination } from 'swiper/modules';

// Carrousel « coverflow » : la carte centrale est en avant, les voisines
// reculent en profondeur.
//
// Deux écarts avec la version d'origine, tous deux imposés par le projet :
//   - `next/image` est remplacé par `<img>` : le site tourne sur Vite + React
//     Router, pas sur Next.js. Le composant `Image` de Next a besoin du runtime
//     et du serveur d'optimisation de Next, il planterait ici.
//   - l'habillage de démo (badge « Latest component », titre « Card Carousel »,
//     cadres imbriqués) est retiré : c'est la vitrine du composant, pas une
//     mise en forme réutilisable.
export const CardCarousel = ({
  images,
  autoplayDelay = 2000,
  showPagination = true,
  showNavigation = true,
  className = '',
}) => {
  const css = `
  .card-carousel .swiper { width: 100%; padding-bottom: 50px; }
  .card-carousel .swiper-slide { width: 300px; background-position: center; background-size: cover; }
  .card-carousel .swiper-slide img { display: block; width: 100%; }
  /* Les dégradés latéraux de Swiper simulent une ombre : la home est sans ombre. */
  .card-carousel .swiper-3d .swiper-slide-shadow-left,
  .card-carousel .swiper-3d .swiper-slide-shadow-right { background-image: none; background: none; }
  .card-carousel .swiper-pagination-bullet { background: #dbebff; opacity: 1; }
  .card-carousel .swiper-pagination-bullet-active { background: #243037; }
  .card-carousel .swiper-button-next, .card-carousel .swiper-button-prev { color: #243037; }
  .card-carousel .swiper-button-next::after, .card-carousel .swiper-button-prev::after { font-size: 20px; }
  `;

  return (
    <section className={`card-carousel ${className}`}>
      <style>{css}</style>
      <Swiper
        spaceBetween={50}
        autoplay={{ delay: autoplayDelay, disableOnInteraction: false }}
        effect="coverflow"
        grabCursor
        centeredSlides
        loop
        slidesPerView="auto"
        coverflowEffect={{ rotate: 0, stretch: 0, depth: 100, modifier: 2.5 }}
        pagination={showPagination}
        navigation={
          showNavigation
            ? { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
            : undefined
        }
        modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
      >
        {images.map((image) => (
          <SwiperSlide key={image.src}>
            <div className="size-full rounded-3xl">
              <img
                src={image.src}
                width={500}
                height={500}
                loading="lazy"
                className="size-full rounded-xl object-cover"
                alt={image.alt}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default CardCarousel;
