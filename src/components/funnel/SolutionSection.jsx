import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function SolutionSection({ variant }) {
  const benefits = [
    "One filmmaker who understands your vision completely",
    "A pre-vetted network of luxury vendors who work in harmony",
    "A cinematic film that makes you feel every emotion again",
    "Effortless planning with a trusted guide by your side",
  ];

  return (
    <section className="relative bg-stone-900 py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-transparent" />
      <div className="relative max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-amber-500 text-xs uppercase tracking-[0.3em] font-medium">The Solution</span>
            <h2 className="text-3xl md:text-4xl font-light text-white mt-4 leading-tight">
              {variant?.solution_headline || "A Curated Team. A Cinematic Film. Zero Stress."}
            </h2>
            <p className="text-white/50 text-base mt-6 font-light leading-relaxed">
              {variant?.solution_description || ""}
            </p>
            <div className="mt-8 space-y-4">
              {benefits.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-white/70 font-light">{b}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69889f3b2c947c84f1f46fdb/140afff63_coupleshot_251.jpg"
                alt="Cinematic wedding"
                className="w-full h-full object-cover object-[60%]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-2xl bg-amber-600/20 backdrop-blur-xl border border-amber-500/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-light text-white">7+</div>
                <div className="text-[10px] text-white/50 uppercase tracking-wider">Years</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}