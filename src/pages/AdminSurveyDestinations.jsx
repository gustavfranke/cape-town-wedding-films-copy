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
import { Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const DEFAULT_DESTINATIONS = {
  confirmation_headline: "Your Vendor Vault Access Is Confirmed",
  confirmation_text: "We will reach out within 24 to 48 hours with availability and next steps.",
  primary_button_text: "Book Your Free Consultation",
  primary_button_url: "",
  secondary_button_enabled: true,
  secondary_button_text: "Download Vendor Vault",
  secondary_button_url: ""
};

export default function AdminSurveyDestinations() {
  const [form, setForm] = useState(DEFAULT_DESTINATIONS);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: config } = useQuery({
    queryKey: ["survey-config-destinations"],
    queryFn: async () => {
      const configs = await base44.entities.SurveyConfig.filter({ config_key: "destinations" });
      if (configs.length === 0) {
        const newConfig = await base44.entities.SurveyConfig.create({
          config_key: "destinations",
          destinations: DEFAULT_DESTINATIONS
        });
        return newConfig;
      }
      return configs[0];
    },
  });

  useEffect(() => {
    if (config?.destinations) {
      setForm(config.destinations);
    }
  }, [config]);

  const updateMut = useMutation({
    mutationFn: (destinations) => base44.entities.SurveyConfig.update(config.id, { destinations }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["survey-config-destinations"] });
      toast({ title: "Saved", description: "Destination settings saved successfully." });
    },
    onError: () => toast({ title: "Error", description: "Failed to save.", variant: "destructive" }),
  });

  const handleSave = () => {
    updateMut.mutate(form);
  };

  return (
    <AdminLayout currentPage="AdminSurvey">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-white">Survey Destinations</h1>
        <p className="text-white/40 text-sm mt-1">Configure the confirmation screen after survey completion</p>
      </div>

      <Card className="bg-white/[0.03] border-white/[0.06]">
        <CardHeader>
          <CardTitle className="text-white text-base font-medium">Confirmation Screen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="text-white/60 text-xs uppercase tracking-wider">Headline</Label>
            <Input
              value={form.confirmation_headline}
              onChange={e => setForm({ ...form, confirmation_headline: e.target.value })}
              className="mt-2 bg-white/5 border-white/10 text-white rounded-xl"
            />
          </div>
          <div>
            <Label className="text-white/60 text-xs uppercase tracking-wider">Body Text</Label>
            <Textarea
              value={form.confirmation_text}
              onChange={e => setForm({ ...form, confirmation_text: e.target.value })}
              className="mt-2 bg-white/5 border-white/10 text-white rounded-xl min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 bg-white/[0.03] border-white/[0.06]">
        <CardHeader>
          <CardTitle className="text-white text-base font-medium">Primary CTA Button</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="text-white/60 text-xs uppercase tracking-wider">Button Text</Label>
            <Input
              value={form.primary_button_text}
              onChange={e => setForm({ ...form, primary_button_text: e.target.value })}
              className="mt-2 bg-white/5 border-white/10 text-white rounded-xl"
            />
          </div>
          <div>
            <Label className="text-white/60 text-xs uppercase tracking-wider">Button URL</Label>
            <Input
              value={form.primary_button_url}
              onChange={e => setForm({ ...form, primary_button_url: e.target.value })}
              placeholder="https://calendly.com/your-link"
              className="mt-2 bg-white/5 border-white/10 text-white rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 bg-white/[0.03] border-white/[0.06]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base font-medium">Secondary Download Button</CardTitle>
            <Switch
              checked={form.secondary_button_enabled}
              onCheckedChange={v => setForm({ ...form, secondary_button_enabled: v })}
            />
          </div>
        </CardHeader>
        {form.secondary_button_enabled && (
          <CardContent className="space-y-5">
            <div>
              <Label className="text-white/60 text-xs uppercase tracking-wider">Button Text</Label>
              <Input
                value={form.secondary_button_text}
                onChange={e => setForm({ ...form, secondary_button_text: e.target.value })}
                className="mt-2 bg-white/5 border-white/10 text-white rounded-xl"
              />
            </div>
            <div>
              <Label className="text-white/60 text-xs uppercase tracking-wider">Button URL</Label>
              <Input
                value={form.secondary_button_url}
                onChange={e => setForm({ ...form, secondary_button_url: e.target.value })}
                placeholder="https://your-vault-pdf-link.com"
                className="mt-2 bg-white/5 border-white/10 text-white rounded-xl"
              />
            </div>
          </CardContent>
        )}
      </Card>

      <Button
        onClick={handleSave}
        disabled={updateMut.isPending}
        className="mt-6 w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-5"
      >
        <Save className="w-4 h-4 mr-2" /> Save Changes
      </Button>
    </AdminLayout>
  );
}