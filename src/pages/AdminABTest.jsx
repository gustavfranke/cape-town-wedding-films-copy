import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, BarChart3, Eye, FileText, MousePointer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function AdminABTest() {
  const qc = useQueryClient();

  const { data: variants } = useQuery({
    queryKey: ["admin-variants"],
    queryFn: () => base44.entities.PageVariant.list(),
    initialData: [],
  });

  const { data: events } = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => base44.entities.AnalyticsEvent.list("-created_date", 1000),
    initialData: [],
  });

  const { data: settingsArr } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => base44.entities.SiteSettings.list(),
    initialData: [],
  });

  const settings = settingsArr?.[0];

  const updateVariant = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PageVariant.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-variants"] }),
  });

  const updateSettings = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SiteSettings.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-settings"] }),
  });

  const variantData = variants.map(v => {
    const views = events.filter(e => e.event_type === "page_view" && e.variant === v.slug).length;
    const clicks = events.filter(e => e.event_type === "cta_click" && e.variant === v.slug).length;
    const submits = events.filter(e => e.event_type === "form_submit" && e.variant === v.slug).length;
    const rate = views > 0 ? ((submits / views) * 100).toFixed(1) : "0";
    return { name: v.name, slug: v.slug, id: v.id, views, clicks, submits, rate: parseFloat(rate), traffic: v.traffic_percent, is_active: v.is_active };
  });

  const winner = variantData.length > 1 ? variantData.reduce((a, b) => a.rate > b.rate ? a : b) : null;
  const colors = ["#d97706", "#7c3aed"];

  const routeAllTraffic = (slug) => {
    variants.forEach(v => {
      updateVariant.mutate({ id: v.id, data: { traffic_percent: v.slug === slug ? 100 : 0, is_active: v.slug === slug } });
    });
  };

  return (
    <AdminLayout currentPage="AdminABTest">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-white">A/B Testing</h1>
        <p className="text-white/40 text-sm mt-1">Compare Offer 1 vs Offer 2 performance</p>
      </div>

      {settings && (
        <Card className="bg-white/[0.03] border-white/[0.06] mb-6">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Label className="text-white/60">Split Testing</Label>
              <Switch
                checked={settings.split_test_enabled}
                onCheckedChange={v => updateSettings.mutate({ id: settings.id, data: { split_test_enabled: v } })}
              />
              <Badge className={settings.split_test_enabled ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                {settings.split_test_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variant Cards */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {variantData.map((v, i) => (
          <Card key={v.id} className="bg-white/[0.03] border-white/[0.06]">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-white text-base font-medium flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i] }} />
                {v.name}
                {winner?.slug === v.slug && variantData.length > 1 && (
                  <Badge className="bg-amber-500/20 text-amber-400"><Trophy className="w-3 h-3 mr-1" /> Leading</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Views", value: v.views, icon: Eye },
                  { label: "Clicks", value: v.clicks, icon: MousePointer },
                  { label: "Submits", value: v.submits, icon: FileText },
                  { label: "Conv.", value: `${v.rate}%`, icon: BarChart3 },
                ].map((s, si) => (
                  <div key={si} className="text-center p-3 rounded-xl bg-white/[0.03]">
                    <s.icon className="w-3.5 h-3.5 text-white/20 mx-auto mb-1" />
                    <div className="text-lg text-white font-light">{s.value}</div>
                    <div className="text-[10px] text-white/30">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-white/40 text-xs">Traffic %</Label>
                  <Input
                    type="number" min={0} max={100}
                    value={v.traffic}
                    onChange={e => updateVariant.mutate({ id: v.id, data: { traffic_percent: parseInt(e.target.value) || 0 } })}
                    className="w-20 bg-white/5 border-white/10 text-white rounded-xl h-8 text-sm"
                  />
                </div>
                <Button onClick={() => routeAllTraffic(v.slug)} size="sm" variant="outline" className="border-white/10 text-white/40 hover:text-white text-xs">
                  Route 100% Here
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="bg-white/[0.03] border-white/[0.06]">
        <CardHeader>
          <CardTitle className="text-white text-base font-medium">Conversion Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={variantData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                <Bar dataKey="rate" radius={[8, 8, 0, 0]} name="Conversion %">
                  {variantData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}