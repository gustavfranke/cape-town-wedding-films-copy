import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function ProblemSection({ variant }) {
  const painPoints = [
    "Planning a wedding on another continent, without ever seeing the venue in person",
    "Worrying your videographer will miss the moments that matter most",
    "Wondering if you can trust a 'safe pair of hands' you've only met over a video call",
    "Not knowing if the footage will do justice to how far you traveled for this day",
  ];

  return (
    <section className="bg-stone-950 py-20 md:py-32">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-amber-500 text-xs uppercase tracking-[0.3em] font-medium">The Problem</span>
          <h2 className="text-3xl md:text-5xl font-light text-white mt-4 leading-tight">
            {variant?.problem_headline || "Planning a Luxury Wedding Shouldn't Feel This Overwhelming"}
          </h2>
          <p className="text-white/50 text-lg mt-6 max-w-2xl mx-auto font-light leading-relaxed">
            {variant?.problem_description || ""}
          </p>
        </motion.div>

        <div className="grid gap-4">
          {painPoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm"
            >
              <AlertTriangle className="w-5 h-5 text-red-400/70 mt-0.5 shrink-0" />
              <span className="text-white/60 font-light">{point}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}