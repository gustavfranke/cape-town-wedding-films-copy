import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";

import HeroSection from "@/components/funnel/HeroSection";
import CredibilityStrip from "@/components/funnel/CredibilityStrip";
import ProblemSection from "@/components/funnel/ProblemSection";
import SolutionSection from "@/components/funnel/SolutionSection";
import VaultRevealSection from "@/components/funnel/VaultRevealSection";
import BenefitCards from "@/components/funnel/BenefitCards";
import OfferSection from "@/components/funnel/OfferSection";
import SocialProofSection from "@/components/funnel/SocialProofSection";
import TestimonialsCarousel from "@/components/funnel/TestimonialsCarousel";
import ObjectionSection from "@/components/funnel/ObjectionSection";
import ProcessTimeline from "@/components/funnel/ProcessTimeline";
import VaultPreviewGrid from "@/components/funnel/VaultPreviewGrid";
import AuthoritySection from "@/components/funnel/AuthoritySection";
import FAQSection from "@/components/funnel/FAQSection";
import FinalCTASection from "@/components/funnel/FinalCTASection";
import StickyMobileCTA from "@/components/funnel/StickyMobileCTA";
import EditableSection from "@/components/funnel/EditableSection";
import SectionEditModal from "@/components/funnel/SectionEditModal";
import SurveyFlowModal from "@/components/survey/SurveyFlowModal";

const DEFAULT_VARIANT = {
  id: null,
  slug: "offer-1",
  name: "Offer 1",
  is_active: true,
  lead_capture_type: "contact_form",
  hero_headline: "Your Cape Town Wedding Film, Crafted Like Cinema",
  hero_subheadline: "Trusted by 100+ couples across South Africa and Europe to feel every moment, forever.",
  hero_description: "We create cinematic wedding films that capture the real emotion of your day.",
  hero_cta_text: "Request Availability",
  hero_supporting_line: "Limited dates available for 2026 & 2027",
  problem_headline: "Most wedding videos feel like slideshows. Yours won't.",
  problem_description: "Generic videography misses the moments that matter most.",
  solution_headline: "Cinematic Films That Feel Like Your Love Story",
  solution_description: "Every film is hand-crafted with a cinematic eye.",
  vault_headline: "Your Free Luxury Vendor Vault",
  vault_description: "Get our curated list of Cape Town's finest wedding vendors.",
  offer_headline: "What's Included",
  authority_headline: "About the Filmmaker",
  authority_description: "With over 200 weddings filmed across Cape Town and the Winelands.",
  final_cta_headline: "Ready to Capture Your Day?",
  final_cta_description: "Spots fill fast. Check your date is available before it's gone.",
};

export default function FunnelVariantA() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, section: null });

  const slugParam = new URLSearchParams(window.location.search).get("v") || "offer-1";

  const { data: variants } = useQuery({
    queryKey: ["pageVariants", slugParam],
    queryFn: () => base44.entities.PageVariant.filter({ slug: slugParam }),
    initialData: [],
  });

  const { data: testimonials } = useQuery({ queryKey: ["testimonials"], queryFn: () => base44.entities.Testimonial.list(), initialData: [] });
  const { data: faqs } = useQuery({ queryKey: ["faqs"], queryFn: () => base44.entities.FAQ.list("sort_order"), initialData: [] });
  const { data: categories } = useQuery({ queryKey: ["vendorCategories"], queryFn: () => base44.entities.VendorCategory.list(), initialData: [] });
  const { data: settingsArr } = useQuery({ queryKey: ["siteSettings"], queryFn: () => base44.entities.SiteSettings.list(), initialData: [] });

  const variant = variants[0] || DEFAULT_VARIANT;
  const settings = settingsArr?.[0];

  // Load Survey if configured
  const { data: survey } = useQuery({
    queryKey: ["activeSurvey", variant.survey_id],
    queryFn: () => base44.entities.Survey.get(variant.survey_id),
    enabled: !!(variant.lead_capture_type === "survey" && variant.survey_id),
  });

  // Load ContactForm — prefer variant's, fall back to survey's, fall back to default
  const cfId = variant.contact_form_id || survey?.contact_form_id;
  const { data: contactFormArr } = useQuery({
    queryKey: ["activeContactForm", cfId || "default"],
    queryFn: () => cfId
      ? base44.entities.ContactForm.filter({ id: cfId })
      : base44.entities.ContactForm.filter({ is_default: true }),
    initialData: [],
  });
  const contactForm = contactFormArr?.[0] || null;

  const trackEvent = useCallback((type) => {
    base44.entities.AnalyticsEvent.create({
      event_type: type,
      variant: variant?.slug || slugParam,
      device_type: window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
    }).catch(() => {});
  }, [variant?.slug, slugParam]);

  const handleCtaClick = useCallback(() => {
    if (variant.lead_capture_type === "none") return;
    trackEvent("cta_click");
    setModalOpen(true);
  }, [variant.lead_capture_type, trackEvent]);

  useEffect(() => { trackEvent("page_view"); }, []);

  const showModal = variant.lead_capture_type !== "none" && (survey || contactForm);
  const activeSurvey = variant.lead_capture_type === "survey" ? survey : null;

  return (
    <div className="bg-stone-950 min-h-screen">
      <EditableSection sectionId="hero" onEdit={() => setEditModal({ open: true, section: "hero" })}>
        <HeroSection variant={variant} onCtaClick={handleCtaClick} />
      </EditableSection>
      <CredibilityStrip />
      <EditableSection sectionId="problem" onEdit={() => setEditModal({ open: true, section: "problem" })}>
        <ProblemSection variant={variant} />
      </EditableSection>
      <EditableSection sectionId="solution" onEdit={() => setEditModal({ open: true, section: "solution" })}>
        <SolutionSection variant={variant} />
      </EditableSection>
      <TestimonialsCarousel />
      <EditableSection sectionId="vault" onEdit={() => setEditModal({ open: true, section: "vault" })}>
        <VaultRevealSection variant={variant} onCtaClick={handleCtaClick} />
      </EditableSection>
      <BenefitCards />
      <SocialProofSection testimonials={testimonials} />
      <ObjectionSection />
      <ProcessTimeline variant={variant} />
      <EditableSection sectionId="authority" onEdit={() => setEditModal({ open: true, section: "authority" })}>
        <AuthoritySection variant={variant} />
      </EditableSection>
      <FAQSection faqs={faqs} />
      <EditableSection sectionId="offer" onEdit={() => setEditModal({ open: true, section: "offer" })}>
        <OfferSection variant={variant} />
      </EditableSection>
      <EditableSection sectionId="final_cta" onEdit={() => setEditModal({ open: true, section: "final_cta" })}>
        <FinalCTASection variant={variant} onCtaClick={handleCtaClick} />
      </EditableSection>
      <div className="bg-stone-950 pt-16 text-center">
        <span className="text-amber-500/60 text-xs uppercase tracking-[0.3em] font-medium">A Bonus for You</span>
      </div>
      <VaultPreviewGrid categories={categories} onCtaClick={handleCtaClick} />
      <StickyMobileCTA variant={variant} onCtaClick={handleCtaClick} />

      <AnimatePresence>
        {modalOpen && showModal && (
          <SurveyFlowModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            survey={activeSurvey}
            contactForm={contactForm}
            variantId={variant?.id}
            variantSlug={variant?.slug || slugParam}
          />
        )}
      </AnimatePresence>

      <SectionEditModal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, section: null })}
        variant={variant}
        sectionType={editModal.section}
      />

      <footer className="bg-stone-950 border-t border-white/5 py-8 text-center">
        <p className="text-white/20 text-xs">&copy; {new Date().getFullYear()} {settings?.site_name || "Cape Town Wedding Films"}. All rights reserved.</p>
      </footer>
    </div>
  );
}