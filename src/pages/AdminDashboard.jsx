import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Mail, MessageSquare, Users, TrendingUp, CheckCircle, Clock, X } from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const STATUS_OPTIONS = ["new", "contacted", "qualified", "booked", "not_a_fit"];
const statusColors = {
  new: "bg-blue-500/20 text-blue-400",
  contacted: "bg-yellow-500/20 text-yellow-400",
  qualified: "bg-purple-500/20 text-purple-400",
  booked: "bg-green-500/20 text-green-400",
  not_a_fit: "bg-red-500/20 text-red-400",
};
const statusBarColors = {
  new: "#3b82f6",
  contacted: "#eab308",
  qualified: "#a855f7",
  booked: "#22c55e",
  not_a_fit: "#ef4444",
};

export default function AdminDashboard() {
  const [selected, setSelected] = useState(null);
  const qc = useQueryClient();

  const { data: leads } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: () => base44.entities.Lead.list("-created_date"),
    initialData: [],
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-leads"] }),
  });

  const now = new Date();
  const last7 = subDays(now, 7);
  const prev7 = subDays(now, 14);

  const leadsLast7 = leads.filter(l => l.created_date && isAfter(new Date(l.created_date), last7)).length;
  const leadsPrev7 = leads.filter(l => {
    if (!l.created_date) return false;
    const d = new Date(l.created_date);
    return isAfter(d, prev7) && !isAfter(d, last7);
  }).length;
  const trendDiff = leadsLast7 - leadsPrev7;

  const surveyCompleted = leads.filter(l => l.survey_completed).length;
  const completionRate = leads.length > 0 ? ((surveyCompleted / leads.length) * 100).toFixed(1) : 0;

  // Status breakdown
  const statusBreakdown = STATUS_OPTIONS.map(s => ({
    status: s.replace(/_/g, " "),
    count: leads.filter(l => (l.status || "new") === s).length,
    color: statusBarColors[s],
  }));

  const copyToClipboard = (text) => navigator.clipboard.writeText(text || "");

  return (
    <AdminLayout currentPage="AdminDashboard">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Overview of your leads and funnel performance</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardContent className="p-5">
            <Users className="w-4 h-4 text-blue-400 mb-3" />
            <div className="text-2xl font-light text-white">{leads.length}</div>
            <div className="text-xs text-white/30 mt-1">Total Leads</div>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardContent className="p-5">
            <TrendingUp className={`w-4 h-4 mb-3 ${trendDiff >= 0 ? "text-green-400" : "text-red-400"}`} />
            <div className="text-2xl font-light text-white">{leadsLast7}</div>
            <div className="text-xs text-white/30 mt-1">
              Last 7 days
              {leadsPrev7 > 0 && (
                <span className={`ml-2 ${trendDiff >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {trendDiff >= 0 ? "+" : ""}{trendDiff} vs prev 7d
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardContent className="p-5">
            <CheckCircle className="w-4 h-4 text-emerald-400 mb-3" />
            <div className="text-2xl font-light text-white">{completionRate}%</div>
            <div className="text-xs text-white/30 mt-1">Survey Completion Rate</div>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardContent className="p-5">
            <Clock className="w-4 h-4 text-amber-400 mb-3" />
            <div className="text-2xl font-light text-white">{leads.filter(l => (l.status || "new") === "new").length}</div>
            <div className="text-xs text-white/30 mt-1">Awaiting Contact</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Status Breakdown */}
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-white text-base font-medium">Leads by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} allowDecimals={false} />
                  <YAxis dataKey="status" type="category" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                    formatter={(v) => [v, "Leads"]}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {statusBreakdown.map((entry, i) => (
                      <Cell key={i} fill={statusBarColors[entry.status.replace(/ /g, "_")] || "#888"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {statusBreakdown.map(s => (
                <div key={s.status} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusBarColors[s.status.replace(/ /g, "_")] || "#888" }} />
                  <span className="text-white/40 text-xs">{s.status} ({s.count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Survey Completion */}
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-white text-base font-medium">Survey Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-2">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Completed Survey</span>
                  <span className="text-white">{surveyCompleted}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Did Not Complete</span>
                  <span className="text-white">{leads.length - surveyCompleted}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500/50 rounded-full transition-all"
                    style={{ width: leads.length > 0 ? `${((leads.length - surveyCompleted) / leads.length) * 100}%` : "0%" }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="text-center">
                  <div className="text-3xl font-light text-white">{completionRate}%</div>
                  <div className="text-white/40 text-sm mt-1">Overall completion rate</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card className="bg-white/[0.03] border-white/[0.06]">
        <CardHeader>
          <CardTitle className="text-white text-base font-medium">Recent Leads (last 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-white/30 font-normal py-3 pr-4">Name</th>
                  <th className="text-left text-white/30 font-normal py-3 pr-4">Email</th>
                  <th className="text-left text-white/30 font-normal py-3 pr-4 hidden md:table-cell">Date</th>
                  <th className="text-left text-white/30 font-normal py-3 pr-4 hidden lg:table-cell">Variant</th>
                  <th className="text-left text-white/30 font-normal py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 10).map(lead => (
                  <tr
                    key={lead.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors"
                    onClick={() => setSelected(lead)}
                  >
                    <td className="py-3 pr-4 text-white/80">{lead.name}</td>
                    <td className="py-3 pr-4 text-white/50">{lead.email}</td>
                    <td className="py-3 pr-4 text-white/40 hidden md:table-cell">
                      {lead.created_date ? format(new Date(lead.created_date), "MMM d, HH:mm") : "-"}
                    </td>
                    <td className="py-3 pr-4 hidden lg:table-cell">
                      <Badge className="bg-white/5 text-white/40 text-[10px]">{lead.funnel_variant || "-"}</Badge>
                    </td>
                    <td className="py-3">
                      <Badge className={`${statusColors[lead.status] || statusColors.new} text-[10px]`}>
                        {(lead.status || "new").replace(/_/g, " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-white/20">No leads yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-stone-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white font-light text-xl">{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5 mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/30 text-xs uppercase tracking-wider">Email</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/70 truncate">{selected.email}</span>
                    <button onClick={() => copyToClipboard(selected.email)} className="text-white/20 hover:text-white shrink-0"><Copy className="w-3 h-3" /></button>
                  </div>
                </div>
                <div>
                  <span className="text-white/30 text-xs uppercase tracking-wider">Phone</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/70">{selected.phone || "-"}</span>
                    {selected.phone && <button onClick={() => copyToClipboard(selected.phone)} className="text-white/20 hover:text-white"><Copy className="w-3 h-3" /></button>}
                  </div>
                </div>
                <div>
                  <span className="text-white/30 text-xs uppercase tracking-wider">Wedding Date</span>
                  <div className="text-white/70 mt-1">{selected.wedding_date || "-"}</div>
                </div>
                <div>
                  <span className="text-white/30 text-xs uppercase tracking-wider">Variant</span>
                  <div className="text-white/70 mt-1">{selected.funnel_variant || "-"}</div>
                </div>
              </div>

              {selected.tags && selected.tags.length > 0 && (
                <div>
                  <span className="text-white/30 text-xs uppercase tracking-wider">Tags</span>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {selected.tags.map(tag => (
                      <Badge key={tag} className="bg-amber-500/20 text-amber-400">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-white/30 text-xs uppercase tracking-wider">Status</span>
                <Select
                  value={selected.status || "new"}
                  onValueChange={val => {
                    updateMut.mutate({ id: selected.id, data: { status: val } });
                    setSelected({ ...selected, status: val });
                  }}
                >
                  <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <span className="text-white/30 text-xs uppercase tracking-wider">Notes</span>
                <Textarea
                  defaultValue={selected.notes || ""}
                  onBlur={e => {
                    if (e.target.value !== (selected.notes || "")) {
                      updateMut.mutate({ id: selected.id, data: { notes: e.target.value } });
                    }
                  }}
                  placeholder="Add notes..."
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl min-h-[70px]"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-white/10 text-white/60 hover:text-white flex-1"
                  onClick={() => window.open(`mailto:${selected.email}`, "_blank")}
                >
                  <Mail className="w-4 h-4 mr-2" /> Email
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 text-white/60 hover:text-white flex-1"
                  onClick={() => window.open(`https://wa.me/${(selected.phone || "").replace(/\D/g, "")}`, "_blank")}
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> WhatsApp
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}