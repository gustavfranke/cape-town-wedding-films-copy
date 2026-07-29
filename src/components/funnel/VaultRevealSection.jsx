import React from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VaultRevealSection({ variant, onCtaClick }) {
  return (
    <section className="bg-stone-950 py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69889f3b2c947c84f1f46fdb/7d75e68f1_Still2026-02-17171922_171.jpg"
          alt="Elegant wedding venue"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-stone-950/80" />
      </div>
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-8">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>

          <h2 className="text-3xl md:text-5xl font-light text-white leading-tight">
            {variant?.vault_headline || "Unlock the Wedding Vendor Vault"}
          </h2>
          <p className="text-white/50 text-lg mt-6 max-w-2xl mx-auto font-light leading-relaxed">
            {variant?.vault_description || ""}
          </p>

          <div className="mt-10 grid grid-cols-3 md:grid-cols-6 gap-3">
            {["Planners", "Venues", "Florists", "Photo", "Catering", "Beauty"].map((cat, i) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center"
              >
                <span className="text-xs text-white/50 uppercase tracking-wider">{cat}</span>
              </motion.div>
            ))}
          </div>

          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            size="lg"
            className="mt-10 bg-amber-600 hover:bg-amber-700 text-white px-10 py-6 text-base rounded-full shadow-2xl shadow-amber-900/30 transition-all duration-300 hover:scale-105"
          >
            See How It Works <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}