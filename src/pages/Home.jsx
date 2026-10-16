import React, { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";

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

function getDeviceType() {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function getOrAssignVariant(variants) {
  if (!variants || variants.length === 0) return null;

  // Check URL parameter first (e.g., ?variant=variant-a)
  const urlParams = new URLSearchParams(window.location.search);
  const forceVariant = urlParams.get("variant");
  if (forceVariant) {
    const found = variants.find(v => v.slug === forceVariant);
    if (found) {
      sessionStorage.setItem("funnel_variant", found.slug);
      return found;
    }
  }

  const stored = sessionStorage.getItem("funnel_variant");
  if (stored) {
    const found = variants.find(v => v.slug === stored && v.is_active);
    if (found) return found;
  }

  const active = variants.filter(v => v.is_active);
  if (active.length === 0) return variants[0];
  if (active.length === 1) return active[0];

  const total = active.reduce((s, v) => s + (v.traffic_percent || 50), 0);
  const rand = Math.random() * total;
  let cumulative = 0;
  for (const v of active) {
    cumulative += v.traffic_percent || 50;
    if (rand <= cumulative) {
      sessionStorage.setItem("funnel_variant", v.slug);
      return v;
    }
  }
  return active[0];
}

export default function Home() {
  const { data: variants } = useQuery({
    queryKey: ["pageVariants"],
    queryFn: () => base44.entities.PageVariant.list(),
    initialData: [],
  });

  const { data: settingsArr } = useQuery({
    queryKey: ["siteSettings"],
    queryFn: () => base44.entities.SiteSettings.list(),
    initialData: [],
  });

  const settings = settingsArr?.[0];

  useEffect(() => {
    if (variants.length === 0) return;

    // Preserve the ?v= query param through the redirect so FunnelVariantA
    // can load the correct PageVariant and read its sections_enabled.
    const urlParams = new URLSearchParams(window.location.search);
    const vParam = urlParams.get("v") || urlParams.get("variant");
    const qs = vParam ? `?v=${encodeURIComponent(vParam)}` : "";

    // If an explicit offer is requested via ?v=, always honour it and skip A/B logic.
    if (vParam) {
      // Route cape-town-local and europe to their dedicated pages, everything else
      // (offer-1, offer-2, ...) goes to FunnelVariantA which reads ?v=.
      if (vParam === "cape-town-local") {
        window.location.href = createPageUrl("CapeTown") + qs;
      } else if (vParam === "europe") {
        window.location.href = createPageUrl("Mallorca") + qs;
      } else if (vParam === "variant-b") {
        window.location.href = createPageUrl("FunnelVariantB") + qs;
      } else {
        window.location.href = createPageUrl("FunnelVariantA") + qs;
      }
      return;
    }

    // No ?v= param: fall back to split-test / default behaviour.
    if (!settings?.split_test_enabled) {
      window.location.href = createPageUrl("FunnelVariantA") + qs;
      return;
    }

    const variant = getOrAssignVariant(variants);
    if (!variant) return;

    if (variant.slug === "variant-b") {
      window.location.href = createPageUrl("FunnelVariantB") + qs;
    } else {
      window.location.href = createPageUrl("FunnelVariantA") + `?v=${encodeURIComponent(variant.slug)}`;
    }
  }, [variants, settings]);

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}