import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminSettings() {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: settingsArr } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => base44.entities.SiteSettings.list(),
    initialData: [],
  });

  const settings = settingsArr?.[0];

  useEffect(() => {
    if (settings) setForm({ ...settings });
  }, [settings]);

  const updateMut = useMutation({
    mutationFn: async ({ id, data }) => {
      if (id) {
        return base44.entities.SiteSettings.update(id, data);
      } else {
        return base44.entities.SiteSettings.create(data);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      setSaving(false);
      toast({ title: "Settings saved", description: "Your changes have been saved successfully." });
    },
    onError: () => { setSaving(false); toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" }); },
  });

  const handleSave = () => {
    setSaving(true);
    const { id, created_date, updated_date, created_by, ...rest } = form;
    updateMut.mutate({ id: settings?.id || null, data: rest });
  };

  const fields = [
    { section: "General", items: [
      { key: "site_name", label: "Site Name", type: "text" },
      { key: "contact_email", label: "Contact Email", type: "text" },
      { key: "reply_time_text", label: "Reply Time Text", type: "text" },
      { key: "privacy_policy_link", label: "Privacy Policy URL", type: "text" },
    ]},
    { section: "Booking", items: [
      { key: "booking_calendar_link", label: "Booking Calendar Link", type: "text" },
      { key: "thankyou_booking_link", label: "Thank You Page Booking Link", type: "text" },
    ]},
    { section: "Form", items: [
      { key: "form_button_text", label: "Form Button Text", type: "text" },
      { key: "form_success_message", label: "Success Message", type: "text" },
    ]},
    { section: "SEO", items: [
      { key: "seo_title", label: "SEO Title", type: "text" },
      { key: "seo_description", label: "Meta Description", type: "textarea" },
      { key: "og_image_url", label: "OG Image URL", type: "text" },
    ]},
    { section: "Appearance", items: [
      { key: "theme", label: "Theme", type: "select", options: [
        { value: "dark", label: "Dark" },
        { value: "light", label: "Light" }
      ]},
    ]},
  ];

  return (
    <AdminLayout currentPage="AdminSettings">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-white">Settings</h1>
          <p className="text-white/40 text-sm mt-1">Global site configuration</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Settings
        </Button>
      </div>

      <div className="space-y-6 max-w-2xl">
        {fields.map(section => (
          <Card key={section.section} className="bg-white/[0.03] border-white/[0.06]">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base font-medium">{section.section}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.items.map(f => (
                <div key={f.key}>
                  <Label className="text-white/60 text-xs uppercase tracking-wider">{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea
                      value={form[f.key] || ""}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="mt-2 bg-white/5 border-white/10 text-white rounded-xl"
                    />
                  ) : f.type === "select" ? (
                    <select
                      value={form[f.key] || ""}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="mt-2 w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {f.options.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-stone-900">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      value={form[f.key] || ""}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="mt-2 bg-white/5 border-white/10 text-white rounded-xl"
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base font-medium">Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white/60">Split Testing</Label>
              <Switch checked={form.split_test_enabled || false} onCheckedChange={v => setForm({ ...form, split_test_enabled: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-white/60">Show Vendor Vault on Thank You Page</Label>
              <Switch checked={form.thankyou_show_vault || false} onCheckedChange={v => setForm({ ...form, thankyou_show_vault: v })} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}