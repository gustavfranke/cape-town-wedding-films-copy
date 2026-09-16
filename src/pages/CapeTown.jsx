import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Minus, Check, Play, Film, Star, Calendar, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

import HeroSection from "@/components/funnel/HeroSection";
import TestimonialsCarousel from "@/components/funnel/TestimonialsCarousel";
import ProcessTimeline from "@/components/funnel/ProcessTimeline";
import StickyMobileCTA from "@/components/funnel/StickyMobileCTA";
import SurveyFlowModal from "@/components/survey/SurveyFlowModal";

// Local (South Africa) landing page for Meta ads. Self-contained so the
// international page (FunnelVariantA) is untouched.

const VARIANT_ID = "6aaa9ff0a63977b111221dd1";
const VARIANT_SLUG = "cape-town-local";
const CALENDLY_URL = "https://calendly.com/gustavfrankecinematography";

const VARIANT = {
  id: VARIANT_ID,
  slug: VARIANT_SLUG,
  hero_headline: "Your Cape Town Wedding Film, Crafted Like Cinema",
  hero_subheadline: "Films for couples marrying in Cape Town and the Winelands. I take on twenty weddings a year.",
  hero_description: "Documentary at heart, cinematic in feel. I stay out of the way on the day, so what you get back is real.",
  hero_cta_text: "Check Your Date",
  hero_supporting_line: "Now booking 2027 and 2028",
  hero_video_url: "https://base44.app/api/apps/6a0cca42ae1aca31e6d27baa/files/mp/public/6a0cca42ae1aca31e6d27baa/d12695646_WebsiteHeroFinal.mp4",
  process_steps: [
    { step: "01", title: "Reach Out", description: "Share your date and venue. I'll reply within 24 hours." },
    { step: "02", title: "A Call Together", description: "We talk through your day, the people who matter, and how you want to feel when you watch it back." },
    { step: "03", title: "Your Wedding Day", description: "I work quietly in the background, catching the vows, the speeches and the dance floor as they happen." },
    { step: "04", title: "Your Film, Delivered", description: "Your films arrive within 6 to 12 weeks, depending on your collection." },
  ],
};

// Budget qualifier shown before the contact details. Answers become tags on the lead.
const BUDGET_OPTIONS = ["Under R50,000", "R50,000 to R70,000", "R70,000 to R90,000", "R90,000+"];
const LOCAL_SURVEY = {
  questions: [
    {
      field_key: "budget",
      question: "What have you set aside for your wedding film?",
      helper_text: "It helps me recommend the right collection for your day.",
      type: "single_select",
      options: BUDGET_OPTIONS,
      required: true,
      order: 0,
    },
  ],
  tag_rules: BUDGET_OPTIONS.map((opt) => ({
    conditions: [{ field: "budget", operator: "equals", value: opt }],
    tags_to_add: [`Budget: ${opt}`, "Local ad lead"],
  })),
  confirmation_headline: "Thank you, I'll be in touch soon",
  confirmation_text: "I'll check my calendar for your date and reply within 24 hours. If you'd like to talk sooner, book a call below.",
  confirmation_button_text: "Book a Call",
  confirmation_button_url: CALENDLY_URL,
};

// Add full films here (Vimeo or YouTube links). Cards only show once a url is filled in.
const FILMS = [
  { names: "Ben & Camila", venue: "Tintswalo Atlantic, Hout Bay", url: "", poster: "https://base44.app/api/apps/6a0cca42ae1aca31e6d27baa/files/mp/public/6a0cca42ae1aca31e6d27baa/4b60e3f28_ben-camila-v2.jpg" },
  { names: "Hannah & Johnpaul", venue: "Landtscap, Stellenbosch", url: "", poster: "https://base44.app/api/apps/6a0cca42ae1aca31e6d27baa/files/mp/public/6a0cca42ae1aca31e6d27baa/e3e728e61_hannah-johnpaul-v2.jpg" },
  { names: "Finn & Erin", venue: "Boschendal, Franschhoek", url: "", poster: "https://base44.app/api/apps/6a0cca42ae1aca31e6d27baa/files/mp/public/6a0cca42ae1aca31e6d27baa/683462204_finn-erin-v2.jpg" },
];

const STATS = [
  { icon: Calendar, value: "7+", label: "Years Filming Weddings" },
  { icon: Film, value: "100+", label: "Weddings Filmed" },
  { icon: Star, value: "4.9", label: "68 Google Reviews" },
  { icon: Heart, value: "20", label: "Weddings a Year" },
];

const CONCERNS = [
  "A videographer in your face all day, directing moments that should happen on their own",
  "A highlight reel that could be anyone's wedding, cut to the same trending song",
  "Colours pushed so hard your day no longer looks like your day",
  "Vows and speeches cut down to seconds, when they're the parts you'll most want back",
];

const APPROACH = [
  "I oversee every film, from our first call to the final grade",
  "Unobtrusive on the day. Rarely posed, never staged",
  "Natural colour, true to how your day actually looked",
  "Music chosen to carry your story, not follow a trend",
];

const INCLUDED = [
  "A director's eye on every frame, not a camera left running",
  "Natural colour grading and careful sound design",
  "Licensed music, cleared for sharing online",
  "Up to ten hours of coverage, depending on your collection",
  "Your films delivered through a private link to watch, download and share",
  "Personal support from your first message to delivery",
];

const FAQS = [
  { q: "Do you film outside Cape Town?", a: "Yes. I film across the Winelands, the Overberg and further afield. For venues more than 50km from Cape Town, travel is added to your quote and I handle the planning." },
  { q: "How many weddings do you take on?", a: "Twenty a year. It's what lets me give every couple the time their film deserves, before the day and in the edit." },
  { q: "When will we receive our film?", a: "Within 6 to 12 weeks, depending on your collection. Express delivery in under two weeks is available if you need it sooner." },
  { q: "Do we need to meet before the wedding?", a: "We'll always have a call first to talk through your day. If you'd prefer to meet in person in Cape Town, we can arrange that too." },
  { q: "How do we secure our date?", a: "A signed agreement and a 50% deposit. Once those are in place, your date is reserved for you." },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

function Eyebrow({ children }) {
  return <span className="text-amber-500 text-xs uppercase tracking-[0.3em] font-medium">{children}</span>;
}

function CtaButton({ onClick, children, className = "" }) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={`bg-amber-600 hover:bg-amber-700 text-white px-10 py-6 text-base rounded-full font-medium shadow-2xl shadow-amber-900/30 transition-all duration-300 hover:scale-105 ${className}`}
    >
      {children} <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  );
}

export default function CapeTown() {
  const [modalOpen, setModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const { data: contactFormArr } = useQuery({
    queryKey: ["activeContactForm", "default"],
    queryFn: () => base44.entities.ContactForm.filter({ is_default: true }),
    initialData: [],
  });
  const contactForm = contactFormArr?.[0] || null;

  const trackEvent = useCallback((type) => {
    base44.entities.AnalyticsEvent.create({
      event_type: type,
      variant: VARIANT_SLUG,
      device_type: window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
    }).catch(() => {});
  }, []);

  useEffect(() => {
    document.title = "Cape Town Wedding Films | Gustav Franke Cinematography";
    trackEvent("page_view");
  }, [trackEvent]);

  const openForm = useCallback(() => {
    trackEvent("cta_click");
    setModalOpen(true);
  }, [trackEvent]);

  const films = FILMS.filter((f) => f.url);

  return (
    <div className="bg-stone-950 min-h-screen">
      <HeroSection variant={VARIANT} onCtaClick={openForm} />

      {/* Credibility */}
      <section className="bg-stone-950 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className="w-5 h-5 text-amber-500 mx-auto mb-3" />
              <div className="text-2xl md:text-3xl font-light text-white tracking-tight">{s.value}</div>
              <div className="text-xs text-white/40 uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* The difference */}
      <section className="bg-stone-950 py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <Eyebrow>The Difference</Eyebrow>
            <h2 className="text-3xl md:text-5xl font-light text-white mt-4 leading-tight">
              Most wedding videos look the same. Yours shouldn't.
            </h2>
            <p className="text-white/50 text-lg mt-6 max-w-2xl mx-auto font-light leading-relaxed">
              Fast cuts, a drone shot, a trending song, done. That's not what you'll want to watch in twenty years.
            </p>
          </motion.div>
          <div className="grid gap-4">
            {CONCERNS.map((c, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
              >
                <Minus className="w-5 h-5 text-white/30 mt-0.5 shrink-0" />
                <span className="text-white/60 font-light">{c}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="relative bg-stone-900 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
          <motion.div {...fadeUp}>
            <Eyebrow>My Approach</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-light text-white mt-4 leading-tight">
              Films Made to Be Watched in Twenty Years
            </h2>
            <p className="text-white/50 text-base mt-6 font-light leading-relaxed">
              I work quietly, with natural colour and music that carries the story, so your film feels the way the day felt.
            </p>
            <div className="mt-8 space-y-4">
              {APPROACH.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-white/70 font-light">{b}</span>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <CtaButton onClick={openForm}>Check Your Date</CtaButton>
            </div>
          </motion.div>
          <motion.div {...fadeUp} className="aspect-[4/5] rounded-3xl overflow-hidden relative">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69889f3b2c947c84f1f46fdb/140afff63_coupleshot_251.jpg"
              alt="Couple at their Cape Town wedding"
              className="w-full h-full object-cover object-[60%]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* Films (hidden until links are added to FILMS) */}
      {films.length > 0 && (
        <section className="bg-stone-950 py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div {...fadeUp} className="text-center mb-14">
              <Eyebrow>The Films</Eyebrow>
              <h2 className="text-3xl md:text-4xl font-light text-white mt-4">Watch a Few</h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {films.map((f) => (
                <a key={f.names} href={f.url} target="_blank" rel="noopener noreferrer" className="group block">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden relative">
                    <img src={f.poster} alt={f.names} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-white font-light">{f.names}</div>
                    <div className="text-white/40 text-sm">{f.venue}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <TestimonialsCarousel />

      <ProcessTimeline variant={VARIANT} />

      {/* The filmmaker */}
      <section className="bg-stone-900 py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp} className="order-2 md:order-1 aspect-square rounded-3xl overflow-hidden relative">
            <img
              src="https://media.base44.com/images/public/6a0cca42ae1aca31e6d27baa/26b57a130_WhatsAppImage2026-02-17at105640.jpg"
              alt="Gustav Franke"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>
          <motion.div {...fadeUp} className="order-1 md:order-2">
            <Eyebrow>The Filmmaker</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-light text-white mt-4 leading-tight">
              Filmed Across Cape Town and the Winelands
            </h2>
            <p className="text-white/50 mt-6 font-light leading-relaxed">
              I've filmed over 100 weddings, from Tintswalo Atlantic to Boschendal, Quoin Rock and Johannesdal. My background is in documentary and cinema, and I bring that to every wedding: patience, a quiet presence, and an eye for the moments nobody planned.
            </p>
            <div className="mt-8 flex gap-10">
              {[["100+", "Weddings"], ["7+", "Years"], ["20", "Per Year"]].map(([v, l]) => (
                <div key={l}>
                  <div className="text-3xl font-light text-amber-400">{v}</div>
                  <div className="text-xs text-white/30 uppercase tracking-wider mt-1">{l}</div>
                </div>
              ))}
            </div>
            <div className="mt-10 pl-5 border-l-2 border-amber-500">
              <p className="text-white/70 font-light italic leading-relaxed text-sm md:text-base">
                "I want to understand your story and what this day means to you. That's what lets me make a film you'll be proud to show your family, and one you can't wait to sit down and show your kids one day."
              </p>
              <p className="mt-3 text-amber-400 text-sm font-medium">Gustav Franke</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Included */}
      <section className="bg-stone-950 py-20 md:py-28 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-600/5 blur-[120px]" />
        <div className="relative max-w-4xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <Eyebrow>Every Collection</Eyebrow>
            <h2 className="text-3xl md:text-5xl font-light text-white mt-4 leading-tight">What's Included</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-4">
            {INCLUDED.map((item) => (
              <div key={item} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-white font-light leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-white/40 text-sm font-light italic mt-12">
            Collections from R50,000. Tell me about your day and I'll recommend what fits.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-stone-900 py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <Eyebrow>Questions</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-light text-white mt-4">Before You Enquire</h2>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={f.q} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left">
                  <span className="text-white font-light pr-4">{f.q}</span>
                  <ChevronDown className={`w-5 h-5 text-white/30 shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-white/50 font-light leading-relaxed text-sm">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-stone-950 py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://base44.app/api/apps/6a0cca42ae1aca31e6d27baa/files/mp/public/6a0cca42ae1aca31e6d27baa/4992a8e28_CeremonyClip-min.png"
            alt=""
            className="w-full h-full object-cover opacity-10"
            loading="lazy"
          />
        </div>
        <motion.div {...fadeUp} className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-light text-white leading-tight">Let's Talk About Your Day</h2>
          <p className="text-white/50 text-lg mt-6 font-light leading-relaxed max-w-xl mx-auto">
            I take on twenty weddings a year. If your date is still open, I'd love to hear about it.
          </p>
          <div className="mt-10">
            <CtaButton onClick={openForm} className="px-12 py-7 text-lg">Check Your Date</CtaButton>
          </div>
          <p className="text-amber-400 text-sm mt-6 font-light tracking-wide">Collections from R50,000</p>
          <p className="text-white/30 text-sm mt-3 tracking-wider">Now booking 2027 and 2028</p>
        </motion.div>
      </section>

      <StickyMobileCTA variant={VARIANT} onCtaClick={openForm} />

      <AnimatePresence>
        {modalOpen && (
          <SurveyFlowModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            survey={LOCAL_SURVEY}
            contactForm={contactForm}
            variantId={VARIANT_ID}
            variantSlug={VARIANT_SLUG}
          />
        )}
      </AnimatePresence>

      <footer className="bg-stone-950 border-t border-white/5 py-8 text-center">
        <p className="text-white/20 text-xs">&copy; {new Date().getFullYear()} Gustav Franke Cinematography. All rights reserved.</p>
      </footer>
    </div>
  );
}
