import React from "react";
import { motion } from "framer-motion";
import { Shield, Clock, Trophy } from "lucide-react";

const objections = [
  {
    icon: Trophy,
    question: "Why premium?",
    answer: "Because your wedding deserves the highest standard. Every detail, from the vendors we recommend to the way we edit your film, reflects a commitment to excellence that mass-market providers simply can't match.",
  },
  {
    icon: Clock,
    question: "Why are bookings limited?",
    answer: "Quality is our obsession. By accepting only a limited number of weddings per season, we guarantee every couple receives our complete, undivided attention (before, during, and after the big day).",
  },
  {
    icon: Shield,
    question: "Why should I trust this network?",
    answer: "Every vendor in the Vault has been personally vetted over 12 years and hundreds of weddings. These aren't paid listings. They're relationships built on trust, talent, and consistently outstanding results.",
  },
];

export default function ObjectionSection() {
  return (
    <section className="bg-stone-950 py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-amber-500 text-xs uppercase tracking-[0.3em] font-medium">Common Questions</span>
          <h2 className="text-3xl md:text-4xl font-light text-white mt-4">You Might Be Wondering…</h2>
        </motion.div>

        <div className="space-y-6">
          {objections.map((o, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.06]"
            >
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <o.icon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg mb-2">{o.question}</h3>
                  <p className="text-white/40 font-light leading-relaxed">{o.answer}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}