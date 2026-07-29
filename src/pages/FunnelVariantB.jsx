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

const DEFAULT_VARIANT_B = {
  id: null,
  slug: "offer-2",
  name: "Offer 2",
  is_active: true,
  lead_capture_type: "contact_form",
  hero_headline: "Timeless Films for Cape Town's Most Romantic Weddings",
  hero_subheadline: "We tell your love story with the depth and beauty it deserves.",
  hero_description: "Every couple deserves a film that makes them feel everything again.",
  hero_cta_text: "Check Availability",
  hero_supporting_line: "Only a handful of dates remain for 2025",
  problem_headline: "Your wedding day will be over in hours. Your film lasts forever.",
  problem_description: "Don't leave your memories to chance.",
  solution_headline: "Films That Honour the Emotion of Your Day",
  solution_description: "From the quiet moments before the ceremony to the last dance.",
  vault_headline: "Exclusive Luxury Vendor Vault",
  vault_description: "Unlock our hand-picked list of Cape Town's top wedding vendors.",
  offer_headline: "Everything You Get",
  authority_headline: "Meet Your Filmmaker",
  authority_description: "200+ weddings across the Cape Winelands and beyond.",
  final_cta_headline: "Don't Let Your Date Slip Away",
  final_cta_description: "We only take a limited number of weddings each year.",
};

export default function FunnelVariantB() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, section: null });

  const slugParam = new URLSearchParams(window.location.search).get("v") || "offer-2";

  const { data: variants } = useQuery({
    queryKey: ["pageVariants", slugParam],
    queryFn: () => base44.entities.PageVariant.filter({ slug: slugParam }),
    initialData: [],
  });

  const { data: testimonials } = useQuery({ queryKey: ["testimonials"], queryFn: () => base44.entities.Testimonial.list(), initialData: [] });
  const { data: faqs } = useQuery({ queryKey: ["faqs"], queryFn: () => base44.entities.FAQ.list("sort_order"), initialData: [] });
  const { data: categories } = useQuery({ queryKey: ["vendorCategories"], queryFn: () => base44.entities.VendorCategory.list(), initialData: [] });
  const { data: settingsArr } = useQuery({ queryKey: ["siteSettings"], queryFn: () => base44.entities.SiteSettings.list(), initialData: [] });

  const variant = variants[0] || DEFAULT_VARIANT_B;
  const settings = settingsArr?.[0];

  const { data: survey } = useQuery({
    queryKey: ["activeSurvey", variant.survey_id],
    queryFn: () => base44.entities.Survey.get(variant.survey_id),
    enabled: !!(variant.lead_capture_type === "survey" && variant.survey_id),
  });

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
      <EditableSection sectionId="vault" onEdit={() => setEditModal({ open: true, section: "vault" })}>
        <VaultRevealSection variant={variant} onCtaClick={handleCtaClick} />
      </EditableSection>
      <BenefitCards />
      <SocialProofSection testimonials={testimonials} />
      <ObjectionSection />
      <ProcessTimeline variant={variant} />
      <VaultPreviewGrid categories={categories} onCtaClick={handleCtaClick} />
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