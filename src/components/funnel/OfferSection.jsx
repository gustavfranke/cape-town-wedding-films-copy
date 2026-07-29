import React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const DEFAULT_ITEMS = [
  { title: "A director's eye on every frame, not a fixed camera left running" },
  { title: "Professional color grading and sound design" },
  { title: "Licensed music, cleared for public and social sharing" },
  { title: "Access to our trusted vendor network, with exclusive discounts and perks from planners, florists, and venues we've worked with for years" },
  { title: "A private online gallery to view, download, and share your film" },
  { title: "Ongoing support from enquiry to delivery" },
];

export default function OfferSection({ variant }) {
  const items = variant?.offer_items?.length ? variant.offer_items : DEFAULT_ITEMS;

  return (
    <section className="bg-stone-950 py-20 md:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-600/5 blur-[120px]" />
      <div className="relative max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 text-xs uppercase tracking-widest">Your Experience</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-light text-white leading-tight">
            {variant?.offer_headline || "What's Included"}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/20 transition-all duration-500 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-500/20 transition-colors">
                  <Check className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">{item.title}</h3>
                  {item.description && <p className="text-white/40 text-sm font-light leading-relaxed">{item.description}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-white/40 text-sm font-light italic mt-12">
          Collections and add-ons vary by coverage and location. Ask us what fits your day.
        </p>
      </div>
    </section>
  );
}