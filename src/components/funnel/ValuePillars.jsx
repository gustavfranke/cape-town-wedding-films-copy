import React from "react";
import { motion } from "framer-motion";
import { Camera, Palette, Clapperboard } from "lucide-react";

const PILLARS = [
  {
    icon: Camera,
    title: "Unobtrusive & Natural",
    body: "No forced poses or scripted moments. We blend seamlessly into your day so you and your guests remain completely present.",
  },
  {
    icon: Palette,
    title: "True-to-Life Color & Tone",
    body: "Polished, natural color grading that reflects the authentic beauty of the Winelands landscape. Never short-lived trends.",
  },
  {
    icon: Clapperboard,
    title: "Rich Cinematic Storytelling",
    body: "We capture crystal-clear vows, speeches, and ambient soundscapes to build a film that feels like a true piece of cinema.",
  },
];

export default function ValuePillars() {
  return (
    <section className="bg-stone-950 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="text-center md:text-left"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto md:mx-0 mb-5">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-white text-xl font-light mb-3">{p.title}</h3>
                <p className="text-white/50 font-light leading-relaxed text-sm">{p.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}