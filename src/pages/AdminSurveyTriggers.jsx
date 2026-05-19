import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const DEFAULT_TRIGGERS = {
  cta_enabled: true,
  scroll_enabled: false,
  scroll_percent: 50,
  time_enabled: false,
  time_seconds: 30,
  exit_intent_enabled: false
};

export default function AdminSurveyTriggers() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: config } = useQuery({
    queryKey: ["survey-config-triggers"],
    queryFn: async () => {
      const configs = await base44.entities.SurveyConfig.filter({ config_key: "triggers" });
      if (configs.length === 0) {
        const newConfig = await base44.entities.SurveyConfig.create({
          config_key: "triggers",
          triggers: DEFAULT_TRIGGERS
        });
        return newConfig;
      }
      return configs[0];
    },
  });

  const updateMut = useMutation({
    mutationFn: (triggers) => base44.entities.SurveyConfig.update(config.id, { triggers }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["survey-config-triggers"] });
      toast({ title: "Saved", description: "Trigger settings updated." });
    },
    onError: () => toast({ title: "Error", description: "Failed to save.", variant: "destructive" }),
  });

  const triggers = config?.triggers || DEFAULT_TRIGGERS;

  const handleUpdate = (key, value) => {
    updateMut.mutate({ ...triggers, [key]: value });
  };

  return (
    <AdminLayout currentPage="AdminSurvey">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-white">Survey Triggers</h1>
        <p className="text-white/40 text-sm mt-1">Configure when the survey modal appears</p>
      </div>

      <div className="space-y-6">
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base font-medium">CTA Button Trigger</CardTitle>
              <Switch
                checked={triggers.cta_enabled}
                onCheckedChange={v => handleUpdate("cta_enabled", v)}
              />
            </div>
            <p className="text-white/40 text-sm mt-2">Survey opens when user clicks CTA buttons (recommended)</p>
          </CardHeader>
        </Card>

        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base font-medium">Scroll Percentage Trigger</CardTitle>
              <Switch
                checked={triggers.scroll_enabled}
                onCheckedChange={v => handleUpdate("scroll_enabled", v)}
              />
            </div>
            <p className="text-white/40 text-sm mt-2">Show survey after user scrolls a percentage of the page</p>
          </CardHeader>
          {triggers.scroll_enabled && (
            <CardContent>
              <Label className="text-white/60 text-xs">Scroll Percentage (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={triggers.scroll_percent}
                onChange={e => handleUpdate("scroll_percent", parseInt(e.target.value) || 50)}
                className="mt-2 bg-white/5 border-white/10 text-white rounded-xl"
              />
            </CardContent>
          )}
        </Card>

        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base font-medium">Time Delay Trigger</CardTitle>
              <Switch
                checked={triggers.time_enabled}
                onCheckedChange={v => handleUpdate("time_enabled", v)}
              />
            </div>
            <p className="text-white/40 text-sm mt-2">Show survey after visitor spends time on page</p>
          </CardHeader>
          {triggers.time_enabled && (
            <CardContent>
              <Label className="text-white/60 text-xs">Delay (seconds)</Label>
              <Input
                type="number"
                min={0}
                value={triggers.time_seconds}
                onChange={e => handleUpdate("time_seconds", parseInt(e.target.value) || 30)}
                className="mt-2 bg-white/5 border-white/10 text-white rounded-xl"
              />
            </CardContent>
          )}
        </Card>

        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base font-medium">Exit Intent Trigger (Desktop)</CardTitle>
              <Switch
                checked={triggers.exit_intent_enabled}
                onCheckedChange={v => handleUpdate("exit_intent_enabled", v)}
              />
            </div>
            <p className="text-white/40 text-sm mt-2">Show survey when user moves mouse to leave page (desktop only)</p>
          </CardHeader>
        </Card>
      </div>
    </AdminLayout>
  );
}