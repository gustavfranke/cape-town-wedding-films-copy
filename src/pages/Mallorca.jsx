import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Check, Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import HeroSection from "@/components/funnel/HeroSection";
import StickyMobileCTA from "@/components/funnel/StickyMobileCTA";
import SurveyFlowModal from "@/components/survey/SurveyFlowModal";

// Europe / Mallorca landing page. Self-contained so the Cape Town and
// international pages are untouched.

const VARIANT_ID = "6ace692cfa2ebd9a5586953a";
const VARIANT_SLUG = "europe";
// Personal piece-to-camera shown on the confirmation screen once an inquiry is
// submitted. Upload to the media library and paste the file URL here. While it
// is empty the modal falls back to the reaction video.
const WELCOME_VIDEO_URL = "";
const WELCOME_VIDEO_INTRO =
  "A quick hello from me, and what happens next.";

// --- Images -----------------------------------------------------------------
const FILES = "https://base44.app/api/apps/6a0cca42ae1aca31e6d27baa/files/mp/public/6a0cca42ae1aca31e6d27baa/";
const IMG = {
  heroPoster: `${FILES}d305e2fb3_liv-sebs-main.png`,
  story: `${FILES}4277f51bb_sebslivcoupleshoot.jpg`, // Liv & Sebs, olive grove
  approach: `${FILES}21ae9c10d_couplewalk_311.jpg`, // Kelly & Sina, Almond Valley
  break: `${FILES}684dac4e8_confettilivandsebs_153_171.jpg`, // confetti exit
  testimonials: `${FILES}3db3c0e57_AdiJanaLucerneWedding.png`, // Adi & Jana, Lucerne
  filmmaker: `${FILES}f5ee1ea96_03a-heart-behind-film.jpg`,
  process: `${FILES}4277f51bb_sebslivcoupleshoot.jpg`, // Liv & Sebs, olive grove
  finalCta: `${FILES}45f87306d_WideshotofLivSebs.png`, // long table, Finca Comasema
};

const VARIANT = {
  id: VARIANT_ID,
  slug: VARIANT_SLUG,
  hero_headline: "Cinematic Wedding Films in Mallorca and Across Europe",
  hero_subheadline:
    "Historic fincas, coastal estates, and the day as it actually happened. I lead every shoot and cut every film myself.",
  hero_description:
    "Travel and accommodation across Europe included in every collection. No hidden fees, no VAT added.",
  hero_cta_text: "Check 2027 Availability",
  hero_supporting_line: "Now booking the 2027 European season",
  hero_video_url:
    "https://base44.app/api/apps/6a0cca42ae1aca31e6d27baa/files/mp/public/6a0cca42ae1aca31e6d27baa/43673d441_HeroFilmEurope.mp4",
  hero_image_url: IMG.heroPoster,
};

// --- Films ------------------------------------------------------------------
// Posters come straight from YouTube so no uploads are needed.
const FILMS = [
  { names: "Liv & Sebs", venue: "Finca Comasema, Mallorca", id: "6mLl4wLbAcU" },
  { names: "Kelly & Sina", venue: "Almond Valley, Mallorca", id: "fnF_G6vxpN4" },
  { names: "Jenny & Daniel", venue: "Mallorca", id: "u3pG68OGduE" },
  { names: "Adi & Jana", venue: "Lucerne, Switzerland", id: "1BgGHG3vpy4" },
  { names: "James & Olivia", venue: "Positano, Italy", id: "VSc1CBQYkJY" },
  { names: "Devon & Nicole", venue: "Kefalonia, Greece", id: "lFQhzBQBfaM" },
];

const poster = (id) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
const embed = (id) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

// --- Testimonials -----------------------------------------------------------
const LEAD_QUOTE = {
  text: "Gustav was incredible at our wedding and made us content that he really captured absolutely everything we wanted and we will cherish forever. His attention to detail, his artistic vision and hard work stood out in all his content he delivered for us.",
  names: "Liv & Sebs",
  venue: "Finca Comasema, Mallorca",
};

const TESTIMONIALS = [
  {
    text: "I was in Rome at the time, planning our wedding in Greece and speaking to Gustav in South Africa. After explaining my vision for our wedding film, I felt a sense of understanding as well as genuine passion from Gustav. He truly understood our vision, brought it to life and absolutely nailed the assignment, and delivered sooner than we expected.",
    names: "Devon & Nicole",
    venue: "Kefalonia, Greece",
  },
  {
    text: "Gustav was so keen to understand our story as a couple and how we saw our day unfolding. The way he has told the story of our day is so seamless. From the chaos of our nieces and nephews, to the intimate moments together, the footage he captured will be something we cherish for the rest of our lives.",
    names: "Tegan & Tom",
    venue: "Siena, Italy",
  },
  {
    text: "Not sure where to start with this review, everything exceeded our expectations. The footage Gustav captured was beautiful, and he captured the atmosphere of the day perfectly.",
    names: "James & Olivia",
    venue: "Positano, Italy",
  },
  {
    text: "He captured all of the most important moments of our wedding so beautifully, without us even noticing him doing it. We felt like we had another friend there the entire time. The videos look like a feature production film.",
    names: "Adi & Jana",
    venue: "Lucerne, Switzerland",
  },
];

// --- Copy -------------------------------------------------------------------
const APPROACH = [
  "A small number of European weddings each season, planned carefully",
  "Travel and accommodation across Europe included in every collection",
  "I lead every shoot and edit every film myself",
  "Unobtrusive on the day. Rarely posed, never staged",
  "Natural colour, true to how your day actually looked",
  "Music chosen to carry your story, not follow a trend",
];

const COLLECTIONS = [
  {
    name: "Collection I",
    price: "€4,500",
    items: [
      "8 hours of coverage",
      "One cinematographer",
      "Highlight film, 3 to 5 minutes",
      "Digital download, 6 month access",
    ],
  },
  {
    name: "Collection II",
    price: "€6,000",
    featured: true,
    items: [
      "10 hours of coverage",
      "Two cinematographers",
      "Teaser trailer within 7 days",
      "Highlight film, 4 to 6 minutes",
      "Full edits of ceremony and speeches",
      "Delivered in 4K",
    ],
  },
  {
    name: "Collection III",
    price: "€7,500",
    items: [
      "10 hours of coverage",
      "Two cinematographers",
      "Teaser trailer within 72 hours",
      "Highlight film, 6 to 8 minutes",
      "Feature film, 18 to 20 minutes",
      "Full edits of ceremony and speeches",
      "First dance edit",
      "Drone coverage",
      "Delivered in 4K",
    ],
  },
];

const PROCESS = [
  { step: "01", title: "Reach Out", description: "Share your date and venue. I reply within 24 hours." },
  { step: "02", title: "A Call Together", description: "We talk through your day, the people who matter, and how you want to feel watching it back." },
  { step: "03", title: "Your Wedding Day", description: "I work quietly in the background, catching the vows, the speeches and the dance floor as they happen." },
  { step: "04", title: "Your Film, Delivered", description: "Your films arrive within 8 to 12 weeks. Express delivery under two weeks is available." },
];

const FAQS = [
  { q: "Where in Europe do you film?", a: "I travel across Europe for destination weddings, with a strong focus on Mallorca, Italy, Greece, Switzerland and France. Because I handle international logistics regularly, all travel and accommodation expenses are completely built into your collection price, meaning zero hidden fees or surprise invoices for you." },
  { q: "Who actually films our wedding?", a: "I do. I'm lead camera at every European wedding, so the person you book is the person who shows up on your day. On Collections II and III a second cinematographer works alongside me for extra angles, briefed and directed by me throughout. Every film is made under my direction, from the first call to the final grade." },
  { q: "We haven't met you. How does that work?", a: "We set up a video call before you book to connect and chat through your vision, followed by a detailed planning call closer to the day. Most of my destination couples book me via video call, feeling completely at ease knowing their film is in dedicated hands." },
  { q: "When will we receive our film?", a: "Within 8 to 12 weeks, depending on your collection. Express delivery in under two weeks is available as an add-on." },
  { q: "How do we secure our date?", a: "A signed agreement and a 50% deposit. Once those are in place, your date is reserved for you." },
];

const BUDGET_OPTIONS = ["Under €4,500", "€4,500 to €6,000", "€6,000 to €7,500", "€7,500+"];
const EUROPE_SURVEY = {
  questions: [
    {
      field_key: "budget",
      question: "What have you set aside for your wedding film?",
      helper_text: "This helps me match your celebration with the right collection.",
      type: "single_select",
      options: BUDGET_OPTIONS,
      required: true,
      order: 0,
    },
  ],
  tag_rules: BUDGET_OPTIONS.map((opt) => ({
    conditions: [{ field: "budget", operator: "equals", value: opt }],
    tags_to_add: [`Budget: ${opt}`, "Europe lead"],
  })),
  confirmation_headline: "Thank you, I'll be in touch soon",
  confirmation_text:
    "I'll check my calendar for your date and reply personally within 24 hours.",
};

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

function FilmLightbox({ film, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close film"
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
          <iframe
            src={embed(film.id)}
            title={`${film.names} wedding film`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        <div className="mt-4 text-center">
          <div className="text-white font-light">{film.names}</div>
          <div className="text-white/40 text-sm">{film.venue}</div>
        </div>
      </div>
    </motion.div>
  );
}

function Quote({ text, names, venue, className = "" }) {
  return (
    <figure className={className}>
      <blockquote className="text-white/80 font-light italic leading-relaxed text-lg md:text-xl">
        {text}
      </blockquote>
      <figcaption className="mt-5">
        <div className="text-white text-sm tracking-wide">{names}</div>
        <div className="text-amber-400/80 text-xs uppercase tracking-[0.2em] mt-1">{venue}</div>
      </figcaption>
    </figure>
  );
}

export default function Mallorca() {
  const [modalOpen, setModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeFilm, setActiveFilm] = useState(null);
  const [slide, setSlide] = useState(0);

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
    document.title = "Mallorca & Europe Wedding Films | Gustav Franke Cinematography";
    trackEvent("page_view");
  }, [trackEvent]);

  const openForm = useCallback(() => {
    trackEvent("cta_click");
    setModalOpen(true);
  }, [trackEvent]);

  const openFilm = useCallback(
    (film) => {
      trackEvent("film_play");
      setActiveFilm(film);
    },
    [trackEvent]
  );

  return (
    <div className="bg-stone-950 min-h-screen">
      <HeroSection variant={VARIANT} onCtaClick={openForm} highContrast />

      {/* Lead testimonial, kept high on the page */}
      <section className="relative bg-stone-900 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.story} alt="" className="w-full h-full object-cover opacity-20" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-950/70 to-stone-950" />
        </div>
        <motion.div {...fadeUp} className="relative max-w-3xl mx-auto px-6 text-center">
          <Eyebrow>Mallorca</Eyebrow>
          <Quote {...LEAD_QUOTE} className="mt-8" />
        </motion.div>
      </section>

      {/* The filmmaker */}
      <section className="bg-stone-950 py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp} className="order-2 md:order-1 aspect-square rounded-3xl overflow-hidden relative">
            <img src={IMG.filmmaker} alt="Gustav Franke filming a wedding" className="w-full h-full object-cover" loading="lazy" />
          </motion.div>
          <motion.div {...fadeUp} className="order-1 md:order-2">
            <Eyebrow>The Filmmaker</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-light text-white mt-4 leading-tight">
              The Heart Behind Your Film
            </h2>
            <p className="text-white/50 mt-6 font-light leading-relaxed">
              Every couple I film gets the same standard I hold myself to. That means my own eye behind the
              lens, on every wedding, without exception. I shoot, direct and edit every project myself, so
              nothing is handed off and nothing is diluted. A film made with care and attention from the
              first call to the final grade.
            </p>
            <div className="mt-8 flex gap-10">
              {[["100+", "Weddings"], ["7+", "Years"], ["20", "Per Year"]].map(([v, l]) => (
                <div key={l}>
                  <div className="text-3xl font-light text-amber-400">{v}</div>
                  <div className="text-[11px] text-white/60 uppercase tracking-[0.15em] mt-2">{l}</div>
                </div>
              ))}
            </div>
            <div className="mt-10 pl-5 border-l-2 border-amber-500">
              <p className="text-white/70 font-light italic leading-relaxed text-sm md:text-base">
                "I care about people and the stories they're living through, more than I care about being
                behind a camera. I hope your film lets you relive the day, over and over again."
              </p>
              <p className="mt-3 text-amber-400 text-sm font-medium">Gustav Franke</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* My answer */}
      <section className="relative bg-stone-900 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
          <motion.div {...fadeUp}>
            <Eyebrow>How I Work</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-light text-white mt-4 leading-tight">
              I live in Europe for the season, and I film every wedding myself
            </h2>
            <p className="text-white/50 text-base mt-6 font-light leading-relaxed">
              Most couples book me without ever meeting me in person. These are the things that make that an
              easy decision.
            </p>
            <div className="mt-8 space-y-4">
              {APPROACH.map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-white/70 font-light">{b}</span>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <CtaButton onClick={openForm}>Check 2027 Availability</CtaButton>
            </div>
          </motion.div>
          <motion.div {...fadeUp} className="aspect-[4/5] rounded-3xl overflow-hidden relative">
            <img src={IMG.approach} alt="A wedding in Europe" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* Films */}
      <section className="bg-stone-950 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <Eyebrow>The Films</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-light text-white mt-4">Watch a Few</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {FILMS.map((f) => (
              <button key={f.id} onClick={() => openFilm(f)} className="group block text-left">
                <div className="aspect-video rounded-2xl overflow-hidden relative bg-stone-900">
                  <img
                    src={poster(f.id)}
                    alt={`${f.names} wedding film`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <Play className="w-5 h-5 text-white fill-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-white font-light">{f.names}</div>
                  <div className="text-white/40 text-sm">{f.venue}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Full-width break */}
      <section className="relative h-[40vh] md:h-[60vh] overflow-hidden">
        <img src={IMG.break} alt="Confetti as a couple leave their ceremony in Mallorca" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-transparent to-stone-900" />
      </section>

      {/* Testimonials */}
      <section className="relative bg-stone-900 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.testimonials} alt="" className="w-full h-full object-cover opacity-[0.12]" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-900/80 to-stone-950" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Eyebrow>In Their Words</Eyebrow>
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              <Quote {...TESTIMONIALS[slide]} className="text-center" />
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setSlide((s) => (s - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
              aria-label="Previous testimonial"
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  aria-label={`Testimonial ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === slide ? "w-6 bg-amber-500" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setSlide((s) => (s + 1) % TESTIMONIALS.length)}
              aria-label="Next testimonial"
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="bg-stone-900 py-20 md:py-28 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-600/5 blur-[120px]" />
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <Eyebrow>Collections</Eyebrow>
            <h2 className="text-3xl md:text-5xl font-light text-white mt-4 leading-tight">
              Every price is final
            </h2>
            <p className="text-white/50 text-lg mt-6 max-w-2xl mx-auto font-light leading-relaxed">
              Travel and accommodation across Europe are fully included. No VAT added, nothing invoiced
              afterwards.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {COLLECTIONS.map((c, i) => (
              <motion.div
                key={c.name}
                {...fadeUp}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className={`relative p-8 rounded-2xl border h-full ${
                  c.featured
                    ? "bg-white/[0.06] border-amber-500/30"
                    : "bg-white/[0.03] border-white/[0.06]"
                }`}
              >
                {c.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-600 text-white text-[10px] uppercase tracking-[0.2em]">
                    Most Popular
                  </div>
                )}
                <div className="text-white/40 text-xs uppercase tracking-[0.2em]">{c.name}</div>
                <div className="text-4xl font-light text-white mt-3">{c.price}</div>
                <div className="h-px bg-white/10 my-6" />
                <ul className="space-y-3">
                  {c.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-amber-400/70 shrink-0 mt-1" />
                      <span className="text-white/70 font-light text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-white/40 text-sm font-light italic mt-12">
            Tell me about your day and I'll recommend the collection that fits.
          </p>
          <div className="text-center mt-8">
            <CtaButton onClick={openForm}>Check 2027 Availability</CtaButton>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="relative bg-stone-950 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={IMG.process}
            alt=""
            className="w-full h-full object-cover opacity-30"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-950/75 to-stone-900" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-14">
            <Eyebrow>How To Book Me</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-light text-white mt-4">Securing Your Date</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS.map((p) => (
              <motion.div
                key={p.step}
                {...fadeUp}
                className="p-6 rounded-2xl bg-stone-950/70 backdrop-blur-sm border border-white/[0.08]"
              >
                <div className="text-amber-500/70 text-sm tracking-widest">{p.step}</div>
                <div className="text-white font-light mt-3">{p.title}</div>
                <p className="text-white/55 text-sm font-light leading-relaxed mt-2">{p.description}</p>
              </motion.div>
            ))}
          </div>
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
          <img src={IMG.finalCta} alt="" className="w-full h-full object-cover opacity-30" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/60 to-stone-950/80" />
        </div>
        <motion.div {...fadeUp} className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-light text-white leading-tight">Let's Talk About Your Day</h2>
          <p className="text-white/50 text-lg mt-6 font-light leading-relaxed max-w-xl mx-auto">
            I take on twenty weddings a year across both continents. If your date is still open, I'd love to
            hear about it.
          </p>
          <div className="mt-10">
            <CtaButton onClick={openForm} className="px-12 py-7 text-lg">Check 2027 Availability</CtaButton>
          </div>
          <p className="text-amber-400 text-sm mt-6 font-light tracking-wide">Collections from €4,500, travel and accommodation included</p>
          <p className="text-white/55 text-sm mt-3 tracking-wider">Now booking the 2027 European season</p>
        </motion.div>
      </section>

      <StickyMobileCTA variant={VARIANT} onCtaClick={openForm} />

      <AnimatePresence>
        {activeFilm && <FilmLightbox film={activeFilm} onClose={() => setActiveFilm(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {modalOpen && (
          <SurveyFlowModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            survey={EUROPE_SURVEY}
            contactForm={contactForm}
            variantId={VARIANT_ID}
            variantSlug={VARIANT_SLUG}
            responseNote="I personally review every inquiry and will be in touch within 24 hours."
            confirmationVideo={
              WELCOME_VIDEO_URL
                ? { url: WELCOME_VIDEO_URL, intro: WELCOME_VIDEO_INTRO }
                : null
            }
          />
        )}
      </AnimatePresence>

      <footer className="bg-stone-950 border-t border-white/5 py-8 text-center">
        <p className="text-white/40 text-xs">&copy; {new Date().getFullYear()} Gustav Franke Cinematography. All rights reserved.</p>
      </footer>
    </div>
  );
}
