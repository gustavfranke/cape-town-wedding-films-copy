import React from "react";
import { motion } from "framer-motion";

const DEFAULT_STEPS = [
  { step: "01", title: "Reach Out", description: "Tell us your date, venue, and the story you want to tell. We respond within 24 hours." },
  { step: "02", title: "We Plan Together", description: "A quick call to align on style, key moments, and the people who matter most to you." },
  { step: "03", title: "Your Wedding Day", description: "We capture every moment unobtrusively — the vows, the tears, the dance floor — without ever getting in the way." },
  { step: "04", title: "Your Film, Delivered", description: "Within 4–6 weeks you receive your cinematic film, crafted to be watched for generations." },
];

export default function ProcessTimeline({ variant }) {
  const steps = (variant?.process_steps && variant.process_steps.length > 0) ? variant.process_steps : DEFAULT_STEPS;

  return (
    <section className="bg-stone-900 py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-amber-500 text-xs uppercase tracking-[0.3em] font-medium">The Journey</span>
          <h2 className="text-3xl md:text-4xl font-light text-white mt-4">How It Works</h2>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/40 via-amber-500/20 to-transparent hidden md:block" />
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/40 via-amber-500/20 to-transparent md:hidden" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`flex items-start gap-6 md:gap-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                <div className={`hidden md:block md:w-1/2 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                  <div className="text-5xl font-extralight text-amber-500/20">{step.step}</div>
                  <h3 className="text-xl font-light text-white mt-2">{step.title}</h3>
                  <p className="text-white/40 text-sm font-light mt-2 leading-relaxed">{step.description}</p>
                </div>

                {/* Dot */}
                <div className="relative z-10 shrink-0">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center">
                    <span className="text-amber-400 text-sm font-medium">{step.step}</span>
                  </div>
                </div>

                {/* Mobile content */}
                <div className="md:w-1/2 md:hidden">
                  <h3 className="text-lg font-light text-white">{step.title}</h3>
                  <p className="text-white/40 text-sm font-light mt-1 leading-relaxed">{step.description}</p>
                </div>

                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}