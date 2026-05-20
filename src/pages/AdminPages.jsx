import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, ExternalLink, Copy, Check, Save, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const SECTION_FIELDS = [
  { key: "hero_headline", label: "Hero Headline", type: "text" },
  { key: "hero_subheadline", label: "Hero Subheadline", type: "textarea" },
  { key: "hero_description", label: "Hero Description", type: "textarea" },
  { key: "hero_cta_text", label: "CTA Button Text", type: "text" },
  { key: "hero_supporting_line", label: "Supporting Line", type: "text" },
  { key: "hero_video_url", label: "Hero Video URL", type: "text" },
  { key: "hero_video_start_time", label: "Video Start Time (seconds)", type: "number" },
  { key: "hero_video_end_time", label: "Video End Time (seconds)", type: "number" },
  { key: "hero_image_url", label: "Hero Image URL", type: "text" },
  { key: "problem_headline", label: "Problem Headline", type: "text" },
  { key: "problem_description", label: "Problem Description", type: "textarea" },
  { key: "solution_headline", label: "Solution Headline", type: "text" },
  { key: "solution_description", label: "Solution Description", type: "textarea" },
  { key: "vault_headline", label: "Vault Headline", type: "text" },
  { key: "vault_description", label: "Vault Description", type: "textarea" },
  { key: "offer_headline", label: "Offer Headline", type: "text" },
  { key: "authority_headline", label: "Authority Headline", type: "text" },
  { key: "authority_description", label: "Authority Description", type: "textarea" },
  { key: "authority_image_url", label: "Authority Image URL", type: "text" },
  { key: "final_cta_headline", label: "Final CTA Headline", type: "text" },
  { key: "final_cta_description", label: "Final CTA Description", type: "textarea" },
];

function SlugEditor({ variant, onSaved }) {
  const [slug, setSlug] = useState(variant.slug);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const baseUrl = window.location.origin;
  const liveUrl = `${baseUrl}/?v=${slug}`;

  const isValidSlug = (s) => /^[a-z0-9-]+$/.test(s) && s.length > 0;

  const mut = useMutation({
    mutationFn: (newSlug) => base44.entities.PageVariant.update(variant.id, { slug: newSlug }),
    onSuccess: (_, newSlug) => {
      qc.invalidateQueries({ queryKey: ["admin-variants"] });
      toast({ title: "Slug updated", description: `Your live URL is now ${baseUrl}/?v=${newSlug}` });
      onSaved();
    },
    onError: (err) => {
      toast({ title: "Failed to update slug", description: err?.message || "An error occurred.", variant: "destructive" });
    },
  });

  const handleSave = async () => {
    if (!isValidSlug(slug)) {
      toast({ title: "Invalid slug", description: "Use only lowercase letters, numbers, and hyphens.", variant: "destructive" });
      return;
    }
    const all = await base44.entities.PageVariant.list();
    const conflict = all.find(v => v.slug === slug && v.id !== variant.id);
    if (conflict) {
      toast({ title: "Slug already in use", description: "Choose a different slug.", variant: "destructive" });
      return;
    }
    mut.mutate(slug);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2 mt-4">
      <Label className="text-white/40 text-xs uppercase tracking-wider">URL Slug</Label>
      <div className="flex gap-2">
        <Input
          value={slug}
          onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          className="bg-white/5 border-white/10 text-white rounded-xl text-sm flex-1"
        />
        <Button
          onClick={handleSave}
          disabled={mut.isPending || slug === variant.slug}
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shrink-0"
        >
          {mut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
          Save
        </Button>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-white/20 text-xs font-mono truncate flex-1">{liveUrl}</span>
        <button onClick={copyUrl} className="text-white/30 hover:text-amber-400 transition-colors shrink-0">
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

function ContentEditor({ variant, onClose }) {
  const [form, setForm] = useState({ ...variant });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: (data) => base44.entities.PageVariant.update(variant.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-variants"] });
      setSaving(false);
      toast({ title: "Changes saved" });
    },
    onError: (err) => {
      setSaving(false);
      toast({ title: "Save failed", description: err?.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    setSaving(true);
    const { id, created_date, updated_date, created_by, ...rest } = form;
    mut.mutate(rest);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-stone-900 border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white font-light">Edit Content: {variant.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {SECTION_FIELDS.map(f => (
            <div key={f.key}>
              <Label className="text-white/50 text-xs uppercase tracking-wider">{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea
                  value={form[f.key] || ""}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl min-h-[70px]"
                />
              ) : f.type === "number" ? (
                <Input
                  type="number"
                  value={form[f.key] || ""}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value ? parseInt(e.target.value) : null })}
                  className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl"
                />
              ) : (
                <Input
                  value={form[f.key] || ""}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl"
                />
              )}
            </div>
          ))}
          <Button onClick={handleSave} disabled={saving} className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-5 mt-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPages() {
  const [editing, setEditing] = useState(null);
  const qc = useQueryClient();

  const { data: variants } = useQuery({
    queryKey: ["admin-variants"],
    queryFn: () => base44.entities.PageVariant.list(),
    initialData: [],
  });

  return (
    <AdminLayout currentPage="AdminPages">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-white">Landing Pages</h1>
        <p className="text-white/40 text-sm mt-1">Manage your offers</p>
      </div>

      <div className="grid gap-6">
        {variants.map(v => (
          <Card key={v.id} className="bg-white/[0.03] border-white/[0.06]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-white text-lg font-semibold">{v.name}</h2>
                    <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                  </div>
                  <p className="text-white/50 text-sm truncate mb-1">{v.hero_headline || "—"}</p>
                  <p className="text-white/30 text-xs">CTA: {v.hero_cta_text || "—"}</p>
                  <SlugEditor variant={v} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-variants"] })} />
                </div>
                <div className="flex flex-col gap-2 shrink-0 mt-1">
                  <Button
                    onClick={() => window.open(`${window.location.origin}/?v=${v.slug}`, "_blank")}
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-white/60 hover:text-white rounded-xl"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Live
                  </Button>
                  <Button
                    onClick={() => setEditing(v)}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit Content
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {variants.length === 0 && (
          <div className="text-center py-16 text-white/20">
            <p>No offers found. They may still be loading...</p>
          </div>
        )}
      </div>

      {editing && <ContentEditor variant={editing} onClose={() => setEditing(null)} />}
    </AdminLayout>
  );
}