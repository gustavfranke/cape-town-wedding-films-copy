import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function SectionEditModal({ isOpen, onClose, variant, sectionType }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (variant) {
      setForm({ ...variant });
    }
  }, [variant]);

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PageVariant.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pageVariants"] });
      qc.invalidateQueries({ queryKey: ["admin-variants"] });
      setSaving(false);
      toast({ title: "Changes saved", description: "Section updated successfully." });
    },
    onError: (err) => {
      setSaving(false);
      toast({ title: "Save failed", description: err?.message || "An error occurred.", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!variant?.id) {
      toast({ title: "Cannot save", description: "No offer found in DB. Go to Landing Pages and create Offer 1 first.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { id, created_date, updated_date, created_by, ...rest } = form;
    updateMut.mutate({ id: variant.id, data: rest });
  };

  const getFieldsForSection = () => {
    switch (sectionType) {
      case "hero":
        return [
          { key: "hero_headline", label: "Headline", type: "text" },
          { key: "hero_subheadline", label: "Subheadline", type: "text" },
          { key: "hero_description", label: "Description", type: "textarea" },
          { key: "hero_cta_text", label: "CTA Button Text", type: "text" },
          { key: "hero_supporting_line", label: "Supporting Line", type: "text" },
          { key: "hero_video_url", label: "Video URL", type: "text" },
          { key: "hero_video_start_time", label: "Video Start Time (seconds)", type: "number" },
          { key: "hero_video_end_time", label: "Video End Time (seconds)", type: "number" },
          { key: "hero_image_url", label: "Image URL (fallback)", type: "text" },
        ];
      case "problem":
        return [
          { key: "problem_headline", label: "Headline", type: "text" },
          { key: "problem_description", label: "Description", type: "textarea" },
        ];
      case "solution":
        return [
          { key: "solution_headline", label: "Headline", type: "text" },
          { key: "solution_description", label: "Description", type: "textarea" },
        ];
      case "vault":
        return [
          { key: "vault_headline", label: "Headline", type: "text" },
          { key: "vault_description", label: "Description", type: "textarea" },
        ];
      case "offer":
        return [
          { key: "offer_headline", label: "Headline", type: "text" },
        ];
      case "authority":
        return [
          { key: "authority_headline", label: "Headline", type: "text" },
          { key: "authority_description", label: "Description", type: "textarea" },
          { key: "authority_image_url", label: "Image URL", type: "text" },
        ];
      case "final_cta":
        return [
          { key: "final_cta_headline", label: "Headline", type: "text" },
          { key: "final_cta_description", label: "Description", type: "textarea" },
        ];
      default:
        return [];
    }
  };

  const fields = getFieldsForSection();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-stone-900 border-white/10 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit {sectionType} Section</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {fields.map(field => (
            <div key={field.key}>
              <Label className="text-white/80 text-sm">{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea
                  value={form[field.key] || ""}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  className="mt-2 bg-white/5 border-white/10 text-white"
                  rows={4}
                />
              ) : field.type === "number" ? (
                <Input
                  type="number"
                  value={form[field.key] || ""}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value ? parseInt(e.target.value) : null })}
                  className="mt-2 bg-white/5 border-white/10 text-white"
                />
              ) : (
                <Input
                  value={form[field.key] || ""}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  className="mt-2 bg-white/5 border-white/10 text-white"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="border-white/10 text-white hover:bg-white/5">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}