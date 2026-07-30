import React from "react";
import { motion } from "framer-motion";

export default function AuthoritySection({ variant }) {
  return (
    <section className="bg-stone-900 py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="order-2 md:order-1"
          >
            <div className="aspect-square rounded-3xl overflow-hidden relative">
              <img
                src={variant?.authority_image_url || "https://media.base44.com/images/public/6a0cca42ae1aca31e6d27baa/26b57a130_WhatsAppImage2026-02-17at105640.jpg"}
                alt="Filmmaker"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 md:order-2"
          >
            <span className="text-amber-500 text-xs uppercase tracking-[0.3em] font-medium">The Filmmaker</span>
            <h2 className="text-3xl md:text-4xl font-light text-white mt-4 leading-tight">
              {variant?.authority_headline || "7 Years. Hundreds of Weddings. One Obsession."}
            </h2>
            <p className="text-white/50 mt-6 font-light leading-relaxed">
              {variant?.authority_description || ""}
            </p>
            <div className="mt-8 flex gap-8">
              <div>
                <div className="text-3xl font-light text-amber-400">100+</div>
                <div className="text-xs text-white/30 uppercase tracking-wider mt-1">Weddings</div>
              </div>
              <div>
                <div className="text-3xl font-light text-amber-400">7+</div>
                <div className="text-xs text-white/30 uppercase tracking-wider mt-1">Years</div>
              </div>
            </div>
            <blockquote className="mt-10 pl-5 border-l-2 border-amber-500">
              <p className="text-white/70 font-light italic leading-relaxed text-sm md:text-base">
                "I value a strong connection with all of my brides and grooms, and understanding your story and the significance of your wedding. This allows me to capture your day in a way that I feel best represents you as people, and your relationship. My films are crafted so that you feel proud to show your friends and family for years to come, and so that you can't wait to sit down one day and show your kids this magical occasion, frozen in time."
              </p>
              <footer className="mt-3 text-amber-400 text-sm font-medium">Gustav, Founder</footer>
            </blockquote>
          </motion.div>
        </div>
      </div>
    </section>
  );
}