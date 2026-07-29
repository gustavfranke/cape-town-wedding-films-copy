import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    photo: "https://base44.app/api/apps/6a0cca42ae1aca31e6d27baa/files/mp/public/6a0cca42ae1aca31e6d27baa/bf6d29450_RichyKelly.jpg",
    quote: "Gustav did the perfect job at bringing our wedding day back to life months later. We laughed, we cried and we watched in awe of the magic he created.",
    names: "Richard & Kelly",
    venue: "Johannesdal, Stellenbosch",
  },
  {
    photo: "https://base44.app/api/apps/6a0cca42ae1aca31e6d27baa/files/mp/public/6a0cca42ae1aca31e6d27baa/a9a9b9849_HannahJohnpaul.jpg",
    quote: "He has an incredible talent for piecing your day together and bottling the magic along with it. They've made the day come alive again, and we'll cherish them forever.",
    names: "Hannah & Johnpaul",
    venue: "Landtscap, Stellenbosch",
  },
  {
    photo: "https://base44.app/api/apps/6a0cca42ae1aca31e6d27baa/files/mp/public/6a0cca42ae1aca31e6d27baa/029ded641_MichaelaJoe.jpg",
    quote: "Gustav captured the emotion, energy, and feeling of the day so beautifully and authentically, and somehow managed to turn our memories into something even more special than we could have imagined.",
    names: "Michaela & Joe",
    venue: "Bosjes, Breede Valley",
  },
  {
    photo: "https://base44.app/api/apps/6a0cca42ae1aca31e6d27baa/files/mp/public/6a0cca42ae1aca31e6d27baa/86d5bcf49_BenCamila.jpg",
    quote: "The videos he made look like a feature production film that has all of our friends and family amazed.",
    names: "Ben & Camila",
    venue: "Tintswalo Atlantic, Hout Bay",
  },
  {
    photo: "https://base44.app/api/apps/6a0cca42ae1aca31e6d27baa/files/mp/public/6a0cca42ae1aca31e6d27baa/2c25de91e_FinnErin.png",
    quote: "There is a genuine authenticity to his work, which stems from the fact that he really takes the time and makes the effort to get to know you.",
    names: "Finn & Erin",
    venue: "Boschendal, Franschhoek",
  },
  {
    photo: "https://base44.app/api/apps/6a0cca42ae1aca31e6d27baa/files/mp/public/6a0cca42ae1aca31e6d27baa/d3ce547bc_chrisnozzi.jpg",
    quote: 'Without much direction from us, he was able to put together a beautiful video depicting our multicultural wedding, which my mum refers to as "it\'s like watching a movie."',
    names: "Chris & Nozzi",
    venue: "De Uijlenes, Gansbaai",
  },
];

export default function TestimonialsCarousel() {
  const doubled = [...testimonials, ...testimonials];

  return (
    <section className="bg-stone-900 py-20 md:py-28 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-amber-500 text-xs uppercase tracking-[0.3em] font-medium">What Couples Say</span>
          <h2 className="text-3xl md:text-4xl font-light text-white mt-4">Their Wedding Day, Remembered</h2>
        </motion.div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-stone-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-stone-900 to-transparent z-10 pointer-events-none" />

        <div className="testimonials-track flex gap-6">
          {doubled.map((t, i) => (
            <div
              key={i}
              className="shrink-0 w-[300px] md:w-[360px] rounded-3xl bg-white/[0.03] border border-white/[0.06] overflow-hidden"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={t.photo} alt={t.names} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/60 font-light text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <div className="text-white text-sm font-medium">{t.names}</div>
                <div className="text-white/30 text-xs mt-0.5">{t.venue}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}