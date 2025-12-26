
import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { BandMember } from '../types';

interface ThreeDCardProps {
  member: BandMember;
  isSelected: boolean;
  onClick: () => void;
}

const ThreeDCard: React.FC<ThreeDCardProps> = ({ member, isSelected, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smoother, more fluid spring physics for buttery navigation
  const mouseXSpring = useSpring(x, { stiffness: 80, damping: 30, mass: 0.8 });
  const mouseYSpring = useSpring(y, { stiffness: 80, damping: 30, mass: 0.8 });

  // Reduced rotation range for more subtle, premium feel
  const rotateX = useTransform(mouseYSpring, [-200, 200], [18, -18]);
  const rotateY = useTransform(mouseXSpring, [-200, 200], [-18, 18]);

  // Dynamic depth offset based on mouse position
  const translateZ = useTransform(mouseXSpring, [-200, 200], [0, 20]);

  // Real-time chrome reflection mapping
  const reflectX = useTransform(mouseXSpring, [-200, 200], ["0%", "100%"]);
  const reflectY = useTransform(mouseYSpring, [-200, 200], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Touch support for mobile devices
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || !e.touches[0]) return;
    const rect = cardRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left - rect.width / 2;
    const touchY = e.touches[0].clientY - rect.top - rect.height / 2;
    x.set(touchX * 0.5); // Reduced sensitivity for touch
    y.set(touchY * 0.5);
  };

  const handleTouchEnd = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="perspective-[2500px] py-10">
      <motion.div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          rotateY,
          rotateX,
          z: translateZ,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`relative h-[520px] w-[320px] sm:w-[360px] cursor-pointer will-change-transform rounded-[2.5rem] ${isSelected
            ? "shadow-[0_0_100px_rgba(236,72,153,0.4)] ring-2 ring-pink-500/50"
            : "shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
          }`}
      >
        {/* Metal Bezel / Frame with improved gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f5f5f5] via-[#a1a1aa] to-[#27272a] rounded-[2.5rem] p-[3px] shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-30" />

          {/* Internal Card Plate */}
          <div className="relative w-full h-full bg-[#0a0a0a] rounded-[2.3rem] overflow-hidden flex flex-col">

            {/* Dynamic Reflection Overlay (Chrome Effect) - Enhanced */}
            <motion.div
              style={{
                background: `radial-gradient(circle at ${reflectX} ${reflectY}, rgba(255,255,255,0.5) 0%, transparent 50%)`,
                transform: "translateZ(60px)",
              }}
              className="absolute inset-0 pointer-events-none z-30 mix-blend-overlay"
            />

            {/* Secondary shimmer layer for extra depth */}
            <motion.div
              style={{
                background: `linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)`,
                transform: "translateZ(40px)",
              }}
              className="absolute inset-0 pointer-events-none z-25"
            />

            {/* Main Photo with 3D Offset */}
            <motion.div
              style={{ transform: "translateZ(-30px)" }}
              className="absolute inset-0"
            >
              <img
                src={member.photo}
                className="w-full h-full object-cover opacity-90 transition-opacity duration-500"
                alt={member.name}
                loading="lazy"
              />
              {/* Enhanced gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-indigo-500/10" />
            </motion.div>

            {/* Content Layers with Depth - Enhanced typography */}
            <motion.div
              className="mt-auto p-8 relative z-40"
              style={{ transform: "translateZ(100px)" }}
            >
              <div className="inline-block bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-1.5 rounded-full mb-4 shadow-lg">
                <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">{member.role.split(',')[0]}</p>
              </div>
              <h3 className="text-4xl sm:text-5xl font-sync font-bold text-white leading-none mb-2 tracking-tighter drop-shadow-2xl">
                {member.name.split(' ')[0]}
              </h3>
              {member.name.split(' ')[1] && (
                <h3 className="text-2xl font-sync font-bold text-white/70 leading-none mb-3 tracking-tight">
                  {member.name.split(' ').slice(1).join(' ')}
                </h3>
              )}
              <div className="flex items-center gap-3">
                <div className="w-14 h-2 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.8)]" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{member.height}</span>
              </div>
            </motion.div>

            {/* Enhanced Gloss Highlight */}
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/15 via-white/5 to-transparent pointer-events-none" />

            {/* Edge highlight for depth */}
            <div className="absolute inset-0 rounded-[2.3rem] border border-white/10 pointer-events-none" />
          </div>
        </div>

        {/* Outer Halo - Enhanced glow */}
        <div className={`absolute -inset-12 blur-[100px] -z-10 rounded-full transition-opacity duration-500 ${isSelected ? "bg-pink-500/20 opacity-100" : "bg-pink-500/5 opacity-50"
          }`} />

        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full shadow-[0_0_30px_rgba(236,72,153,0.8)]"
          />
        )}
      </motion.div>
    </div>
  );
};

export default ThreeDCard;
