import React from "react";
import { motion } from "framer-motion";
import { Film, Star, Users, Calendar } from "lucide-react";

const stats = [
  { icon: Calendar, value: "12+", label: "Years Experience" },
  { icon: Film, value: "100+", label: "Weddings Filmed" },
  { icon: Star, value: "4.9", label: "68 Google Reviews" },
  { icon: Users, value: "25+", label: "Trusted Vendors" },
];

export default function CredibilityStrip() {
  return (
    <section className="relative bg-stone-950 border-y border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="text-center"
            >
              <stat.icon className="w-5 h-5 text-amber-500 mx-auto mb-3" />
              <div className="text-2xl md:text-3xl font-light text-white tracking-tight">{stat.value}</div>
              <div className="text-xs text-white/40 uppercase tracking-widest mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}