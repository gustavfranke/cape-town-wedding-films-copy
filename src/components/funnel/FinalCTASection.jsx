import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FinalCTASection({ variant, onCtaClick }) {
  return (
    <section className="relative bg-stone-950 py-24 md:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0">
        <img
          src="https://base44.app/api/apps/6a0cca42ae1aca31e6d27baa/files/mp/public/6a0cca42ae1aca31e6d27baa/4992a8e28_CeremonyClip-min.png"
          alt=""
          className="w-full h-full object-cover opacity-10"
          loading="lazy"
        />
      </div>
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-light text-white leading-tight">
            {variant?.final_cta_headline || "Ready to Create Something Extraordinary?"}
          </h2>
          <p className="text-white/50 text-lg mt-6 font-light leading-relaxed max-w-xl mx-auto">
            {variant?.final_cta_description || "Limited bookings available. Enquire now to secure your date."}
          </p>
          <Button
            onClick={onCtaClick}
            size="lg"
            className="mt-10 bg-amber-600 hover:bg-amber-700 text-white px-12 py-7 text-lg rounded-full shadow-2xl shadow-amber-900/40 transition-all duration-300 hover:scale-105"
          >
            Request Availability <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-amber-400 text-sm mt-6 font-light tracking-wide">
            Destination packages from $5,000 USD, including travel within South Africa.
          </p>
          <p className="text-white/30 text-sm mt-4 tracking-wider">Limited bookings for 2026 & 2027</p>
        </motion.div>
      </div>
    </section>
  );
}