import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, ArrowRight, Loader2, Check } from "lucide-react";

const DEFAULT_FIELDS = [
  { id: "f_name", field_key: "name", label: "Full Name", type: "text", required: true, order: 0 },
  { id: "f_email", field_key: "email", label: "Email Address", type: "email", required: true, order: 1 },
  { id: "f_phone", field_key: "phone", label: "WhatsApp Number", type: "tel", required: false, order: 2 },
  { id: "f_date", field_key: "wedding_date", label: "Wedding Date", type: "date", required: false, order: 3 },
  { id: "f_venue", field_key: "venue", label: "Venue", type: "text", required: false, order: 4 },
  { id: "f_msg", field_key: "message", label: "Message", type: "textarea", required: false, order: 5 },
];

function applyTagRules(answers, tagRules) {
  const tags = [];
  (tagRules || []).forEach(rule => {
    const allMet = (rule.conditions || []).every(cond => {
      const val = answers[cond.field];
      if (cond.operator === "equals") return val === cond.value;
      if (cond.operator === "contains") return Array.isArray(val) ? val.includes(cond.value) : String(val).includes(cond.value);
      return false;
    });
    if (allMet) tags.push(...(rule.tags_to_add || []));
  });
  return tags;
}

export default function SurveyFlowModal({ isOpen, onClose, survey, contactForm, variantId, variantSlug }) {
  const [step, setStep] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const questions = survey?.questions ? [...survey.questions].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
  const fields = contactForm?.fields ? [...contactForm.fields].sort((a, b) => (a.order || 0) - (b.order || 0)) : DEFAULT_FIELDS;
  const totalSteps = questions.length + 1; // questions + contact form
  const isInSurvey = step < questions.length;
  const currentQ = questions[step];

  const handleSurveyNext = () => {
    if (currentQ?.required && !surveyAnswers[currentQ.field_key]) {
      setError("This field is required.");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    const requiredFields = fields.filter(f => f.required);
    for (const f of requiredFields) {
      if (!formData[f.field_key]) { setError(`${f.label} is required.`); return; }
    }
    setError("");
    setSubmitting(true);
    try {
      const tags = applyTagRules(surveyAnswers, survey?.tag_rules);
      const leadPayload = { status: "new", funnel_variant: variantSlug || "offer-1" };
      fields.forEach(f => { if (formData[f.field_key]) leadPayload[f.field_key] = formData[f.field_key]; });
      if (survey) { leadPayload.survey_completed = true; leadPayload.tags = tags; }

      const lead = await base44.entities.Lead.create(leadPayload);

      if (survey) {
        await base44.entities.SurveyResponse.create({
          lead_id: lead.id,
          page_variant_id: variantId,
          answers: surveyAnswers,
          tags,
          completed: true,
          progress_step: questions.length,
        });
      }
      setDone(true);
    } catch (e) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmHeadline = survey?.confirmation_headline || contactForm?.success_headline || "Thank you!";
  const confirmText = survey?.confirmation_text || contactForm?.success_message || "We'll be in touch within 24 hours.";
  const confirmBtnText = survey?.confirmation_button_text || contactForm?.success_button_text || "";
  const confirmBtnUrl = survey?.confirmation_button_url || contactForm?.success_button_url || "";

  const progressPct = done ? 100 : Math.round((step / totalSteps) * 100);

  const renderQuestion = () => {
    if (!currentQ) return null;
    const val = surveyAnswers[currentQ.field_key] || "";
    const setVal = (v) => setSurveyAnswers({ ...surveyAnswers, [currentQ.field_key]: v });

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-white text-lg font-light leading-relaxed">{currentQ.question}</h3>
          {currentQ.helper_text && <p className="text-white/40 text-sm mt-1">{currentQ.helper_text}</p>}
        </div>
        {currentQ.type === "text" && <Input value={val} onChange={e => setVal(e.target.value)} className="bg-white/5 border-white/20 text-white rounded-xl" />}
        {currentQ.type === "textarea" && <Textarea value={val} onChange={e => setVal(e.target.value)} className="bg-white/5 border-white/20 text-white rounded-xl" rows={4} />}
        {currentQ.type === "date" && <Input type="date" value={val} onChange={e => setVal(e.target.value)} className="bg-white/5 border-white/20 text-white rounded-xl" />}
        {currentQ.type === "single_select" && (
          <div className="space-y-2">
            {(currentQ.options || []).map(opt => (
              <button key={opt} onClick={() => setVal(opt)} className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${val === opt ? "border-amber-500 bg-amber-500/10 text-white" : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"}`}>{opt}</button>
            ))}
          </div>
        )}
        {currentQ.type === "multi_select" && (
          <div className="space-y-2">
            {(currentQ.options || []).map(opt => {
              const selected = Array.isArray(val) && val.includes(opt);
              return (
                <button key={opt} onClick={() => { const cur = Array.isArray(val) ? val : []; setVal(selected ? cur.filter(v => v !== opt) : [...cur, opt]); }} className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm flex items-center justify-between ${selected ? "border-amber-500 bg-amber-500/10 text-white" : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"}`}>
                  {opt} {selected && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              );
            })}
          </div>
        )}
        <Button onClick={handleSurveyNext} className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-5">
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  };

  const renderContactForm = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-white text-lg font-light">Almost there — just a few details</h3>
        <p className="text-white/40 text-sm mt-1">We'll reach out within 24 hours.</p>
      </div>
      {fields.map(f => (
        <div key={f.id}>
          <label className="text-white/60 text-xs uppercase tracking-wider">{f.label}{f.required && <span className="text-amber-400 ml-1">*</span>}</label>
          {f.type === "textarea" ? (
            <Textarea value={formData[f.field_key] || ""} onChange={e => setFormData({ ...formData, [f.field_key]: e.target.value })} placeholder={f.placeholder} className="mt-1.5 bg-white/5 border-white/20 text-white rounded-xl" rows={3} />
          ) : (
            <Input type={f.type || "text"} value={formData[f.field_key] || ""} onChange={e => setFormData({ ...formData, [f.field_key]: e.target.value })} placeholder={f.placeholder} className="mt-1.5 bg-white/5 border-white/20 text-white rounded-xl" />
          )}
        </div>
      ))}
      <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-5">
        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {contactForm?.submit_button_text || "Submit"}
      </Button>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center py-6 space-y-4">
      <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-amber-400" />
      </div>
      <h3 className="text-white text-2xl font-light">{confirmHeadline}</h3>
      <p className="text-white/50 leading-relaxed">{confirmText}</p>
      {confirmBtnText && confirmBtnUrl && (
        <a href={confirmBtnUrl} target="_blank" rel="noreferrer">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-8">{confirmBtnText}</Button>
        </a>
      )}
      <Button variant="ghost" onClick={onClose} className="text-white/30 hover:text-white text-sm">Close</Button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-stone-950 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Progress bar */}
        {!done && (
          <div className="h-1 bg-white/5 rounded-t-2xl overflow-hidden">
            <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        )}
        <div className="p-8">
          {!done && (
            <div className="flex justify-between items-center mb-6">
              <span className="text-white/20 text-xs">{done ? "" : `Step ${step + 1} of ${totalSteps}`}</span>
              <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          {done ? renderConfirmation() : isInSurvey ? renderQuestion() : renderContactForm()}
        </div>
      </motion.div>
    </div>
  );
}