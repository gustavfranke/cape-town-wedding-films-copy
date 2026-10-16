import React from "react";
import { motion } from "framer-motion";

export default function PricingAnchor() {
  return (
    <section className="bg-stone-950 py-24 px-6 border-t border-white/5">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-amber-500/60 text-xs uppercase tracking-[0.3em] font-medium block mb-4">
            Investment
          </span>
          <p className="text-white/70 font-light leading-relaxed text-lg">
            Full-day coverage from R55,000. Collections include dual-operator coverage, drone where permitted, cinematic audio, and a private online gallery delivered within 10 weeks.
          </p>
        </motion.div>
      </div>
    </section>
  );
}