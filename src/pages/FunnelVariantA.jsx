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
import LeadForm from "@/components/funnel/LeadForm";
import StickyMobileCTA from "@/components/funnel/StickyMobileCTA";
import EditableSection from "@/components/funnel/EditableSection";
import SectionEditModal from "@/components/funnel/SectionEditModal";
import SurveyModal from "@/components/survey/SurveyModal";
import SurveyTrigger from "@/components/survey/SurveyTrigger";

const DEFAULT_VARIANT = {
  id: null,
  slug: "variant-a",
  name: "Variant A",
  is_active: true,
  hero_headline: "Your Cape Town Wedding Film, Crafted Like Cinema",
  hero_subheadline: "Award-winning wedding films for couples who want to feel every moment, forever.",
  hero_description: "We create cinematic wedding films that capture the real emotion of your day — not just the highlights, but the feeling.",
  hero_cta_text: "Request Availability",
  hero_supporting_line: "Limited dates available for 2025",
  problem_headline: "Most wedding videos feel like slideshows. Yours won't.",
  problem_description: "Generic videography misses the moments that matter most. We specialize in cinematic storytelling that preserves the real emotion of your day.",
  solution_headline: "Cinematic Films That Feel Like Your Love Story",
  solution_description: "Every film is hand-crafted with a cinematic eye — from the vows to the first dance, every second matters.",
  vault_headline: "Your Free Luxury Vendor Vault",
  vault_description: "Get our curated list of Cape Town's finest wedding vendors — photographers, florists, planners, and more.",
  offer_headline: "What's Included",
  offer_items: [],
  authority_headline: "About the Filmmaker",
  authority_description: "With over 200 weddings filmed across Cape Town and the Winelands, we bring a director's eye to every celebration.",
  final_cta_headline: "Ready to Capture Your Day?",
  final_cta_description: "Spots fill fast. Check your date is available before it's gone.",
  process_steps: [],
};

export default function FunnelVariantA() {
  const [formOpen, setFormOpen] = useState(false);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [ctaTriggerActive, setCtaTriggerActive] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, section: null });

  const slugParam = new URLSearchParams(window.location.search).get("v") || "offer-1";

  const { data: variants } = useQuery({
    queryKey: ["pageVariants", slugParam],
    queryFn: () => base44.entities.PageVariant.filter({ slug: slugParam }),
    initialData: [],
  });

  const { data: testimonials } = useQuery({
    queryKey: ["testimonials"],
    queryFn: () => base44.entities.Testimonial.list(),
    initialData: [],
  });

  const { data: faqs } = useQuery({
    queryKey: ["faqs"],
    queryFn: () => base44.entities.FAQ.list("sort_order"),
    initialData: [],
  });

  const { data: categories } = useQuery({
    queryKey: ["vendorCategories"],
    queryFn: () => base44.entities.VendorCategory.list(),
    initialData: [],
  });

  const { data: settingsArr } = useQuery({
    queryKey: ["siteSettings"],
    queryFn: () => base44.entities.SiteSettings.list(),
    initialData: [],
  });

  const { data: surveyQuestionsConfig } = useQuery({
    queryKey: ["survey-config-questions"],
    queryFn: async () => {
      const configs = await base44.entities.SurveyConfig.filter({ config_key: "questions" });
      return configs[0] || null;
    },
  });

  const { data: surveyTriggersConfig } = useQuery({
    queryKey: ["survey-config-triggers"],
    queryFn: async () => {
      const configs = await base44.entities.SurveyConfig.filter({ config_key: "triggers" });
      return configs[0] || null;
    },
  });

  const { data: surveyDestinationsConfig } = useQuery({
    queryKey: ["survey-config-destinations"],
    queryFn: async () => {
      const configs = await base44.entities.SurveyConfig.filter({ config_key: "destinations" });
      return configs[0] || null;
    },
  });

  const { data: surveyRulesConfig } = useQuery({
    queryKey: ["survey-config-rules"],
    queryFn: async () => {
      const configs = await base44.entities.SurveyConfig.filter({ config_key: "rules" });
      return configs[0] || null;
    },
  });

  const variant = variants[0] || DEFAULT_VARIANT;
  const settings = settingsArr?.[0];

  const trackEvent = useCallback((type) => {
    if (!variant) return;
    base44.entities.AnalyticsEvent.create({
      event_type: type,
      variant: variant?.slug || "offer-1",
      device_type: window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
    }).catch(() => {});
  }, [variant]);

  const handleCtaClick = useCallback(() => {
    trackEvent("cta_click");
    setCtaTriggerActive(true);
  }, [trackEvent]);

  const handleFormSubmit = async (data) => {
    trackEvent("form_submit");
    await base44.entities.Lead.create({ ...data, status: "new" });
    setFormOpen(false);
    window.location.href = "/ThankYou?variant=variant-a";
  };

  const applyRules = (answers) => {
    const rules = surveyRulesConfig?.rules || [];
    const tags = [];
    
    rules.forEach(rule => {
      const allConditionsMet = rule.conditions.every(cond => {
        const answerValue = answers[cond.field];
        if (cond.operator === "equals") {
          return answerValue === cond.value;
        }
        if (cond.operator === "contains") {
          return Array.isArray(answerValue) && answerValue.includes(cond.value);
        }
        return false;
      });
      
      if (allConditionsMet) {
        rule.actions.forEach(action => {
          if (action.type === "add_tag") tags.push(action.value);
        });
      }
    });
    
    return tags;
  };

  const handleSurveyComplete = async (answers) => {
    trackEvent("survey_completed");
    
    const tags = applyRules(answers);
    
    // Create lead
    const lead = await base44.entities.Lead.create({
      name: answers.full_name,
      email: answers.email,
      phone: answers.whatsapp_number,
      wedding_date: answers.wedding_date,
      guest_count: answers.guest_count,
      funnel_variant: variant?.slug || slugParam,
      status: "new",
      tags,
      survey_completed: true
    });
    
    // Create survey response
    await base44.entities.SurveyResponse.create({
      lead_id: lead.id,
      page_variant_id: variant?.id,
      answers,
      tags,
      completed: true
    });
  };

  useEffect(() => {
    trackEvent("page_view");
  }, []);



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
      
      <EditableSection sectionId="offer" onEdit={() => setEditModal({ open: true, section: "offer" })}>
        <OfferSection variant={variant} />
      </EditableSection>
      
      <SocialProofSection testimonials={testimonials} />
      <ObjectionSection />
      <ProcessTimeline variant={variant} />
      <VaultPreviewGrid categories={categories} onCtaClick={handleCtaClick} />
      
      <EditableSection sectionId="authority" onEdit={() => setEditModal({ open: true, section: "authority" })}>
        <AuthoritySection variant={variant} />
      </EditableSection>
      
      <FAQSection faqs={faqs} />
      
      <EditableSection sectionId="final_cta" onEdit={() => setEditModal({ open: true, section: "final_cta" })}>
        <FinalCTASection variant={variant} onCtaClick={handleCtaClick} />
      </EditableSection>
      
      <StickyMobileCTA variant={variant} onCtaClick={handleCtaClick} />

      <SurveyTrigger
        triggers={surveyTriggersConfig?.triggers || {}}
        onTrigger={() => setSurveyOpen(true)}
        isOpen={surveyOpen}
        ctaTriggerActive={ctaTriggerActive}
      />

      <AnimatePresence>
        {surveyOpen && (
          <SurveyModal
            isOpen={surveyOpen}
            onClose={() => {
              setSurveyOpen(false);
              setCtaTriggerActive(false);
            }}
            questions={surveyQuestionsConfig?.questions || []}
            config={{
              destinations: surveyDestinationsConfig?.destinations || {},
              remember_progress: true
            }}
            onComplete={handleSurveyComplete}
            variantId={variant?.id}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {formOpen && (
          <LeadForm
            isOpen={formOpen}
            variant={variant}
            settings={settings}
            onSubmit={handleFormSubmit}
            onClose={() => setFormOpen(false)}
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