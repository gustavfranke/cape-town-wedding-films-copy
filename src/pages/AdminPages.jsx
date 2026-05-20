import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Pencil, Save, Loader2, Copy, Plus } from "lucide-react";

const DEFAULT_COPY = {
  hero_headline: "Your Cape Town Wedding Film, Crafted Like Cinema",
  hero_subheadline: "Award-winning wedding films for couples who want to feel every moment, forever.",
  hero_description: "We create cinematic wedding films that capture the real emotion of your day.",
  hero_cta_text: "Request Availability",
  hero_supporting_line: "Limited dates available for 2025",
  problem_headline: "Most wedding videos feel like slideshows. Yours won't.",
  problem_description: "Generic videography misses the moments that matter. We specialize in cinematic storytelling.",
  solution_headline: "Cinematic Films That Feel Like Your Love Story",
  solution_description: "Every film is hand-crafted with a cinematic eye — from the vows to the first dance.",
  vault_headline: "Your Free Luxury Vendor Vault",
  vault_description: "Get our curated list of Cape Town's finest wedding vendors.",
  offer_headline: "What's Included",
  authority_headline: "About the Filmmaker",
  authority_description: "With over 200 weddings filmed across Cape Town and the Winelands.",
  final_cta_headline: "Ready to Capture Your Day?",
  final_cta_description: "Spots fill fast. Check your date is available before it's gone.",
};

export default function AdminPages() {
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(null);
  const [createNew, setCreateNew] = useState(false);
  const [newPageForm, setNewPageForm] = useState({ name: "", slug: "", template: "" });
  const [seeded, setSeeded] = useState(false);
  const qc = useQueryClient();

  const { data: variants, isLoading: variantsLoading } = useQuery({
    queryKey: ["admin-variants"],
    queryFn: () => base44.entities.PageVariant.list(),
    initialData: [],
  });

  // Seed Offer 1 and Offer 2 if no variants exist
  React.useEffect(() => {
    if (!variantsLoading && variants.length === 0 && !seeded) {
      setSeeded(true);
      const offers = [
        { ...DEFAULT_COPY, name: "Offer 1", slug: "offer-1", is_active: true, traffic_percent: 50 },
        { ...DEFAULT_COPY, name: "Offer 2", slug: "offer-2", is_active: true, traffic_percent: 50 },
      ];
      offers.forEach(o => base44.entities.PageVariant.create(o).then(() => qc.invalidateQueries({ queryKey: ["admin-variants"] })));
    }
  }, [variantsLoading, variants.length]);

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PageVariant.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-variants"] }); setSaving(false); setEditing(null); },
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.PageVariant.create(data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["admin-variants"] }); 
      setDuplicating(null); 
      setCreateNew(false);
      setNewPageForm({ name: "", slug: "", template: "" });
    },
  });

  const openEdit = (v) => {
    setFormData({ ...v });
    setEditing(v);
  };

  const handleSave = () => {
    setSaving(true);
    const { id, created_date, updated_date, created_by, ...rest } = formData;
    updateMut.mutate({ id: editing.id, data: rest });
  };

  const handleDuplicate = (variant) => {
    const { id, created_date, updated_date, created_by, ...data } = variant;
    const newSlug = `${data.slug}-copy-${Date.now()}`;
    const newData = {
      ...data,
      name: `${data.name} (Copy)`,
      slug: newSlug,
      is_active: false,
      traffic_percent: 0,
    };
    setDuplicating(variant.id);
    createMut.mutate(newData);
  };

  const handleCreateFromTemplate = () => {
    const template = variants.find(v => v.id === newPageForm.template);
    if (!template) return;
    
    const { id, created_date, updated_date, created_by, ...data } = template;
    const newData = {
      ...data,
      name: newPageForm.name,
      slug: newPageForm.slug,
      is_active: false,
      traffic_percent: 0,
    };
    createMut.mutate(newData);
  };

  const fields = [
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

  return (
    <AdminLayout currentPage="AdminPages">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-white">Landing Pages</h1>
          <p className="text-white/40 text-sm mt-1">Manage your offers and landing page content</p>
        </div>
        <Button onClick={() => setCreateNew(true)} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Create New Landing Page
        </Button>
      </div>

      <div className="grid gap-6">
        {variants.map(v => (
          <Card key={v.id} className="bg-white/[0.03] border-white/[0.06]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-white text-base font-medium">{v.name}</CardTitle>
                <Badge className={v.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                  {v.is_active ? "Active" : "Inactive"}
                </Badge>
                <Badge className="bg-white/5 text-white/40">{v.traffic_percent}% traffic</Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleDuplicate(v)} 
                  disabled={duplicating === v.id}
                  variant="outline" 
                  size="sm" 
                  className="border-white/10 text-white/60 hover:text-white"
                >
                  {duplicating === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  Duplicate
                </Button>
                <Button onClick={() => openEdit(v)} variant="outline" size="sm" className="border-white/10 text-white/60 hover:text-white">
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Content
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-white/30 text-xs">Headline</span>
                  <p className="text-white/60 mt-1 line-clamp-2">{v.hero_headline || "-"}</p>
                </div>
                <div>
                  <span className="text-white/30 text-xs">CTA</span>
                  <p className="text-white/60 mt-1">{v.hero_cta_text || "-"}</p>
                </div>
                <div>
                  <span className="text-white/30 text-xs">Slug</span>
                  <p className="text-white/60 mt-1">{v.slug}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="bg-stone-900 border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white font-light">Edit: {editing?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div className="flex items-center gap-3">
              <Label className="text-white/60 text-xs">Active</Label>
              <Switch checked={formData.is_active} onCheckedChange={v => setFormData({ ...formData, is_active: v })} />
            </div>
            <div>
              <Label className="text-white/60 text-xs uppercase tracking-wider">Traffic %</Label>
              <Input
                type="number" min={0} max={100}
                value={formData.traffic_percent || ""}
                onChange={e => setFormData({ ...formData, traffic_percent: parseInt(e.target.value) || 0 })}
                className="mt-2 bg-white/5 border-white/10 text-white rounded-xl"
              />
            </div>
            {fields.map(f => (
              <div key={f.key}>
                <Label className="text-white/60 text-xs uppercase tracking-wider">{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea
                    value={formData[f.key] || ""}
                    onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                    className="mt-2 bg-white/5 border-white/10 text-white rounded-xl min-h-[80px]"
                  />
                ) : f.type === "number" ? (
                  <Input
                    type="number"
                    value={formData[f.key] || ""}
                    onChange={e => setFormData({ ...formData, [f.key]: e.target.value ? parseInt(e.target.value) : null })}
                    className="mt-2 bg-white/5 border-white/10 text-white rounded-xl"
                  />
                ) : (
                  <Input
                    value={formData[f.key] || ""}
                    onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                    className="mt-2 bg-white/5 border-white/10 text-white rounded-xl"
                  />
                )}
              </div>
            ))}
            <Button onClick={handleSave} disabled={saving} className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-5">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={createNew} onOpenChange={() => setCreateNew(false)}>
        <DialogContent className="bg-stone-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white font-light">Create New Landing Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white/60 text-sm">Page Name</Label>
              <Input
                placeholder="e.g., Mallorca Weddings"
                value={newPageForm.name}
                onChange={e => setNewPageForm({ ...newPageForm, name: e.target.value })}
                className="mt-2 bg-white/5 border-white/10 text-white rounded-xl"
              />
            </div>
            <div>
              <Label className="text-white/60 text-sm">URL Slug</Label>
              <Input
                placeholder="e.g., mallorca-weddings"
                value={newPageForm.slug}
                onChange={e => setNewPageForm({ ...newPageForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="mt-2 bg-white/5 border-white/10 text-white rounded-xl"
              />
              <p className="text-white/30 text-xs mt-1">Used in URL: /funnel/{newPageForm.slug || 'your-slug'}</p>
            </div>
            <div>
              <Label className="text-white/60 text-sm">Based on Template</Label>
              <select
                value={newPageForm.template}
                onChange={e => setNewPageForm({ ...newPageForm, template: e.target.value })}
                className="mt-2 w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select a template...</option>
                {variants.map(v => (
                  <option key={v.id} value={v.id} className="bg-stone-900">
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <Button 
              onClick={handleCreateFromTemplate} 
              disabled={!newPageForm.name || !newPageForm.slug || !newPageForm.template || createMut.isPending}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-5"
            >
              {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Landing Page
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}