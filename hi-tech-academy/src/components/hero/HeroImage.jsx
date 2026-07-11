import React, { useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const STAR_IMG = "/images/2c13a8136_Star.png";

const STARS = [
{ top: '6%', left: '2%', size: 52, delay: 0, duration: 4.5, factorX: 1, factorY: 0.8 },
{ top: '10%', left: '18%', size: 36, delay: 0.6, duration: 5.2, factorX: -0.7, factorY: -1 },
{ top: '55%', right: '0%', size: 30, delay: 1.1, duration: 4.8, factorX: 1, factorY: 0.8 },
{ top: '72%', left: '4%', size: 24, delay: 0.3, duration: 6, factorX: -0.7, factorY: -1 },
{ top: '82%', right: '8%', size: 20, delay: 1.5, duration: 5.5, factorX: 1, factorY: 0.8 }];




// Individual star — hooks called at component level, not inside a map callback
const FloatingStar = ({ star, springX, springY }) => {
  const x = useTransform(springX, (v) => v * star.factorX);
  const y = useTransform(springY, (v) => v * star.factorY);
  return (
    <motion.img
      src={STAR_IMG}
      alt=""
      style={{
        position: 'absolute',
        top: star.top,
        left: star.left,
        right: star.right,
        width: star.size,
        height: star.size,
        x,
        y,
        pointerEvents: 'none'
      }}
      animate={{ y: [0, -10, 0], rotate: [0, 15, 0] }}
      transition={{ repeat: Infinity, duration: star.duration, delay: star.delay, ease: 'easeInOut' }} />);


};

export default function HeroImage() {
  const containerRef = useRef(null);

  const springX = useSpring(0, { stiffness: 60, damping: 18 });
  const springY = useSpring(0, { stiffness: 60, damping: 18 });

  // All useTransform at top level
  const badgeRX = useTransform(springX, (v) => v * -0.5);
  const badgeRY = useTransform(springY, (v) => v * -0.5);
  const socialX = useTransform(springX, (v) => v * -0.8);
  const socialY = useTransform(springY, (v) => v * 0.6);
  const insertX = useTransform(springX, (v) => v * 0.7);
  const insertY = useTransform(springY, (v) => v * -0.6);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    springX.set((e.clientX - cx) / rect.width * 18);
    springY.set((e.clientY - cy) / rect.height * 14);
  };

  const handleMouseLeave = () => {
    springX.set(0);
    springY.set(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-end justify-center w-full h-full select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}>
      
      {/* Floating stars */}
      {STARS.map((s, i) =>
      <FloatingStar key={i} star={s} springX={springX} springY={springY} />
      )}

      {/* Rotating text badge — top right */}
      <motion.div className="absolute top-4 right-0 z-20 hidden" style={{ x: badgeRX, y: badgeRY }}>
        <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
          <div className="absolute inset-0 rounded-full" style={{ border: '1.5px solid rgba(255,255,255,0.25)' }} />
          <div className="absolute inset-0 flex items-center justify-center hidden">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: '#F8B102' }}>
              ✦
            </div>
          </div>
        </div>
      </motion.div>

      {/* Social proof card — bottom left */}
      



















      

      {/* Badge taux d'insertion — top left */}
      















      

      {/* Main image with parallax */}
      <motion.img src="/images/96fd5ac18_Girl.webp"

      alt="Étudiante Hi Tech Academy"
      className="relative z-10 w-full max-w-xl object-contain drop-shadow-2xl"
      style={{ x: springX, y: springY }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
      
    </div>);

}