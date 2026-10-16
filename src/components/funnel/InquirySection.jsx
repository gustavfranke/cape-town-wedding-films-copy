import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Check, ArrowRight } from "lucide-react";
import InternationalPhoneInput from "@/components/funnel/InternationalPhoneInput";
import CalendarDateInput from "@/components/funnel/CalendarDateInput";

export default function InquirySection({ contactForm, variantSlug, variantId }) {
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const fields = (contactForm?.fields ? [...contactForm.fields] : [])
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && !formData[f.field_key]) {
        setError(`${f.label.replace(/\s*\(.*\)$/, "")} is required.`);
        return;
      }
    }
    setError("");
    setSubmitting(true);
    try {
      const referralSource = formData.referral_source || "";
      const plannerName = formData.planner_name || "";
      const tags = referralSource ? [referralSource] : [];

      const leadPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        wedding_date: formData.wedding_date,
        venue: formData.venue,
        referral_source: referralSource,
        planner_name: plannerName,
        message: plannerName ? `Wedding planner: ${plannerName}` : "",
        status: "new",
        funnel_variant: variantSlug || "offer-2",
        survey_completed: false,
        tags,
      };

      await base44.entities.Lead.create(leadPayload);

      if (typeof window.fbq === "function") {
        window.fbq("track", "Lead", { content_name: variantSlug || "offer-2" });
      }

      setDone(true);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section id="inquire" className="bg-stone-950 py-24 px-6 border-t border-white/5">
        <div className="max-w-lg mx-auto text-center space-y-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-white text-2xl font-light mb-3">
              {contactForm?.success_headline || "Your inquiry is in."}
            </h3>
            <p className="text-white/50 leading-relaxed">
              {contactForm?.success_message || "I'll be in touch within 24 hours."}
            </p>
            {contactForm?.success_button_text && contactForm?.success_button_url && (
              <a href={contactForm.success_button_url}>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-8 mt-6">
                  {contactForm.success_button_text}
                </Button>
              </a>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="inquire" className="bg-stone-950 py-24 px-6 border-t border-white/5">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-white text-3xl md:text-4xl font-light mb-3">Check your date</h2>
          <p className="text-white/50 font-light">
            Tell me a little about your day. I reply personally within 24 hours.
          </p>
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map((f) => (
            <div key={f.id}>
              <Label className="text-white/60 text-xs uppercase tracking-wider">
                {f.label}
                {f.required && <span className="text-amber-400 ml-1">*</span>}
              </Label>
              {f.type === "tel" ? (
                <InternationalPhoneInput
                  name={f.field_key}
                  value={formData[f.field_key] || ""}
                  onChange={(val) => setFormData({ ...formData, [f.field_key]: val })}
                  required={f.required}
                  placeholder={f.placeholder || "Phone number"}
                  className="mt-2"
                />
              ) : f.type === "date" ? (
                <CalendarDateInput
                  value={formData[f.field_key] || ""}
                  onChange={(val) => setFormData({ ...formData, [f.field_key]: val })}
                  required={f.required}
                  placeholder={f.placeholder || "Select date"}
                  className="mt-2"
                />
              ) : f.type === "select" ? (
                <select
                  name={f.field_key}
                  value={formData[f.field_key] || ""}
                  onChange={(e) => setFormData({ ...formData, [f.field_key]: e.target.value })}
                  required={f.required}
                  className="mt-2 w-full bg-white/5 border border-white/10 text-white rounded-xl h-12 px-4 focus:border-amber-500/50 focus:outline-none appearance-none cursor-pointer"
                >
                  {(f.options || []).map((opt, i) => (
                    <option
                      key={i}
                      value={i === 0 ? "" : opt}
                      disabled={i === 0}
                      className="bg-stone-900 text-white"
                    >
                      {opt}
                    </option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <Textarea
                  name={f.field_key}
                  value={formData[f.field_key] || ""}
                  onChange={(e) => setFormData({ ...formData, [f.field_key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl"
                  rows={3}
                />
              ) : (
                <Input
                  type={f.type || "text"}
                  name={f.field_key}
                  value={formData[f.field_key] || ""}
                  onChange={(e) => setFormData({ ...formData, [f.field_key]: e.target.value })}
                  placeholder={f.placeholder}
                  required={f.required}
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-12 focus:border-amber-500/50"
                />
              )}
            </div>
          ))}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-6 rounded-full text-base font-medium shadow-2xl shadow-amber-900/30 transition-all duration-300 hover:scale-[1.02]"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {contactForm?.submit_button_text || "Check My Date"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}