import React, { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle, Calendar, Lock, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThankYou() {
  const urlParams = new URLSearchParams(window.location.search);
  const variant = urlParams.get("variant") || "";
  const tracked = useRef(false);

  const { data: settingsArr } = useQuery({
    queryKey: ["siteSettings"],
    queryFn: () => base44.entities.SiteSettings.list(),
    initialData: [],
  });
  const settings = settingsArr?.[0];

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      base44.entities.AnalyticsEvent.create({
        event_type: "thankyou_view",
        variant,
        device_type: window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
      }).catch(() => {});
    }
  }, [variant]);

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-lg w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 mb-8"
        >
          <CheckCircle className="w-10 h-10 text-green-400" />
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-light text-white mb-4">
          {settings?.form_success_message || "Thank You! We'll Be In Touch Soon."}
        </h1>

        <p className="text-white/50 font-light mb-4 leading-relaxed">
          Your enquiry has been received. {settings?.reply_time_text || "We typically respond within 24 hours."}
        </p>

        <div className="space-y-4 mt-10">
          {settings?.thankyou_show_vault && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20"
            >
              <Lock className="w-6 h-6 text-amber-400 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-1">Vault Access Confirmed</h3>
              <p className="text-white/40 text-sm font-light">
                You'll receive your Wedding Vendor Vault access details in your email shortly.
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
          >
            <Calendar className="w-6 h-6 text-amber-400 mx-auto mb-3" />
            <h3 className="text-white font-medium mb-1">Book a Consultation Call</h3>
            <p className="text-white/40 text-sm font-light mb-4">
              Want to fast-track? Schedule a personal consultation to discuss your wedding vision.
            </p>
            {settings?.thankyou_booking_link ? (
              <a href={settings.thankyou_booking_link} target="_blank" rel="noopener noreferrer">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-8 py-5 transition-all hover:scale-105">
                  Book a Call <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            ) : (
              <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-8 py-5 transition-all hover:scale-105" disabled>
                Book a Call <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </motion.div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-white/20 text-sm">
          <Heart className="w-3.5 h-3.5" />
          <span>{settings?.site_name || "Gustav Franke Cinematography"}</span>
        </div>
      </motion.div>
    </div>
  );
}