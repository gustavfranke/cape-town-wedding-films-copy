import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Loader2, ArrowRight } from "lucide-react";

export default function LeadForm({ variant, settings, onSubmit, onClose, isOpen }) {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", wedding_date: "", venue: "", guest_count: "", message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ ...formData, funnel_variant: variant?.slug || "unknown" });
    if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-stone-900 border border-white/10 rounded-3xl p-8"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <h3 className="text-2xl font-light text-white">Request Availability</h3>
          <p className="text-white/40 text-sm mt-2 font-light">Tell us about your dream wedding</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="text-white/60 text-xs uppercase tracking-wider">Full Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Your full name"
              className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-12 focus:border-amber-500/50"
            />
          </div>

          <div>
            <Label className="text-white/60 text-xs uppercase tracking-wider">Email Address *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="you@email.com"
              className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-12 focus:border-amber-500/50"
            />
          </div>

          <div>
            <Label className="text-white/60 text-xs uppercase tracking-wider">WhatsApp Number *</Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              placeholder="+27 XX XXX XXXX"
              className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-12 focus:border-amber-500/50"
            />
          </div>

          <div>
            <Label className="text-white/60 text-xs uppercase tracking-wider">Wedding Date *</Label>
            <Input
              type="date"
              value={formData.wedding_date}
              onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
              required
              className="mt-2 bg-white/5 border-white/10 text-white rounded-xl h-12 focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/60 text-xs uppercase tracking-wider">Venue</Label>
              <Input
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="If chosen"
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-12 focus:border-amber-500/50"
              />
            </div>
            <div>
              <Label className="text-white/60 text-xs uppercase tracking-wider">Guest Count</Label>
              <Input
                value={formData.guest_count}
                onChange={(e) => setFormData({ ...formData, guest_count: e.target.value })}
                placeholder="Estimated"
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-12 focus:border-amber-500/50"
              />
            </div>
          </div>

          <div>
            <Label className="text-white/60 text-xs uppercase tracking-wider">Your Vision</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us about your dream wedding..."
              className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl min-h-[80px] focus:border-amber-500/50"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-6 rounded-full text-base font-medium shadow-2xl shadow-amber-900/30 transition-all duration-300 hover:scale-[1.02]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {settings?.form_button_text || "Request Availability"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <p className="text-white/20 text-xs text-center">
            {settings?.reply_time_text || "We typically respond within 24 hours"}
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
}