import React from "react";
import { motion } from "framer-motion";
import { ChevronDown, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection({ variant, onCtaClick }) {
  const getVideoUrl = () => {
    if (!variant?.hero_video_url) return "";
    
    let url = variant.hero_video_url;
    const params = new URLSearchParams();
    
    if (variant.hero_video_start_time) {
      params.append("start", variant.hero_video_start_time);
    }
    if (variant.hero_video_end_time) {
      params.append("end", variant.hero_video_end_time);
    }
    
    if (params.toString()) {
      url += (url.includes("?") ? "&" : "?") + params.toString();
    }
    
    return url;
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video / Image */}
      <div className="absolute inset-0 z-0">
        {variant?.hero_video_url ? (
          variant.hero_video_url.match(/\.(mp4|webm|ogg)$/i) ? (
            <video
              src={`${variant.hero_video_url}#t=0.1`}
              className="absolute w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          ) : (
            <iframe
              src={getVideoUrl()}
              className="absolute w-[200%] h-[200%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen
              title="Hero Video"
            />
          )
        ) : (
          variant?.hero_image_url ? (
            <img
              src={variant.hero_image_url}
              alt="Wedding"
              className="w-full h-full object-cover"
            />
          ) : null
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* Brand Logo */}
      <div className="absolute top-0 left-0 z-10 p-6 md:p-8">
        <img
          src="https://media.base44.com/images/public/6a0cca42ae1aca31e6d27baa/2c43b692f_GF-primary-logo-white.png"
          alt="Gustav Franke Cinematography"
          className="h-16 md:h-20 w-auto opacity-80"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-white/80 text-sm tracking-widest uppercase font-light">Cinematic Wedding Films</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-[1.1] tracking-tight mb-6">
            {variant?.hero_headline || "Your Dream Wedding In Cape Town, Captured Like a Film"}
          </h1>

          <p className="text-lg md:text-xl text-white/70 font-light max-w-2xl mx-auto mb-4 leading-relaxed">
            {variant?.hero_subheadline || "A cinematic wedding experience supported by trusted luxury experts."}
          </p>

          <p className="text-sm md:text-base text-white/50 font-light max-w-xl mx-auto mb-10 leading-relaxed hidden md:block">
            {variant?.hero_description || ""}
          </p>

          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={onCtaClick}
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white px-10 py-6 text-lg rounded-full font-medium tracking-wide shadow-2xl shadow-amber-900/30 transition-all duration-300 hover:scale-105 hover:shadow-amber-900/50"
            >
              {variant?.hero_cta_text || "Access The Luxury Vendor Vault"}
            </Button>
            <span className="text-white/40 text-sm tracking-wider uppercase">
              {variant?.hero_supporting_line || "Limited bookings per season."}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Scroll Cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown className="w-6 h-6 text-white/40" />
      </motion.div>
    </section>
  );
}