import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Download, Copy, MessageSquare, Phone, Mail, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const STATUS_OPTIONS = ["new", "contacted", "qualified", "booked", "not_a_fit"];
const statusColors = {
  new: "bg-blue-500/20 text-blue-400",
  contacted: "bg-yellow-500/20 text-yellow-400",
  qualified: "bg-purple-500/20 text-purple-400",
  booked: "bg-green-500/20 text-green-400",
  not_a_fit: "bg-red-500/20 text-red-400",
};

export default function AdminLeads() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("all");
  const [selected, setSelected] = useState(null);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: leads } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: () => base44.entities.Lead.list("-created_date"),
    initialData: [],
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
      toast({ title: "Lead updated" });
    },
  });

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    let matchDate = true;
    if (filterDateRange !== "all" && l.created_date) {
      const created = new Date(l.created_date);
      const now = new Date();
      const days = parseInt(filterDateRange);
      matchDate = (now - created) / (1000 * 60 * 60 * 24) <= days;
    }
    return matchSearch && matchStatus && matchDate;
  });

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Wedding Date", "Venue", "Status", "Variant", "Created"];
    const rows = filtered.map(l => [l.name, l.email, l.phone, l.wedding_date, l.venue, l.status, l.funnel_variant, l.created_date]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c || ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "leads.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text || "");
  };

  return (
    <AdminLayout currentPage="AdminLeads">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-light text-white">Leads</h1>
          <p className="text-white/40 text-sm mt-1">{leads.length} total leads</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" className="border-white/10 text-white/60 hover:text-white hover:bg-white/5">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <Input
            placeholder="Search name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterDateRange} onValueChange={setFilterDateRange}>
          <SelectTrigger className="w-44 bg-white/5 border-white/10 text-white rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-white/[0.03] border-white/[0.06]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-white/30 font-normal py-3 px-4">Name</th>
                  <th className="text-left text-white/30 font-normal py-3 px-4">Email</th>
                  <th className="text-left text-white/30 font-normal py-3 px-4 hidden md:table-cell">Phone</th>
                  <th className="text-left text-white/30 font-normal py-3 px-4 hidden lg:table-cell">Wedding Date</th>
                  <th className="text-left text-white/30 font-normal py-3 px-4">Status</th>
                  <th className="text-left text-white/30 font-normal py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => (
                  <tr key={lead.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer" onClick={() => setSelected(lead)}>
                    <td className="py-3 px-4 text-white/80">{lead.name}</td>
                    <td className="py-3 px-4 text-white/50">{lead.email}</td>
                    <td className="py-3 px-4 text-white/50 hidden md:table-cell">{lead.phone}</td>
                    <td className="py-3 px-4 text-white/40 hidden lg:table-cell">{lead.wedding_date || "-"}</td>
                    <td className="py-3 px-4">
                      <Badge className={`${statusColors[lead.status] || statusColors.new} text-[10px]`}>{(lead.status || "new").replace(/_/g, " ")}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button onClick={e => { e.stopPropagation(); copyToClipboard(lead.email); }} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white" title="Copy email">
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); copyToClipboard(lead.phone); }} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white" title="Copy phone">
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-white/20">No leads found</td></tr>
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
            <div className="space-y-5 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/30 text-xs uppercase tracking-wider">Email</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/70">{selected.email}</span>
                    <button onClick={() => copyToClipboard(selected.email)} className="text-white/20 hover:text-white"><Copy className="w-3 h-3" /></button>
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
                  <span className="text-white/30 text-xs uppercase tracking-wider">Venue</span>
                  <div className="text-white/70 mt-1">{selected.venue || "-"}</div>
                </div>
                <div>
                  <span className="text-white/30 text-xs uppercase tracking-wider">Guest Count</span>
                  <div className="text-white/70 mt-1">{selected.guest_count || "-"}</div>
                </div>
                <div>
                  <span className="text-white/30 text-xs uppercase tracking-wider">Variant</span>
                  <div className="text-white/70 mt-1">{selected.funnel_variant || "-"}</div>
                </div>
              </div>

              {selected.message && (
                <div>
                  <span className="text-white/30 text-xs uppercase tracking-wider">Message</span>
                  <div className="text-white/50 mt-1 text-sm p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">{selected.message}</div>
                </div>
              )}

              {selected.survey_completed && (
                <div>
                  <span className="text-white/30 text-xs uppercase tracking-wider">Survey Completed</span>
                  <div className="mt-2">
                    <Badge className="bg-green-500/20 text-green-400">Yes</Badge>
                  </div>
                </div>
              )}

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
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl min-h-[80px]"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-white/10 text-white/60 hover:text-white flex-1"
                  onClick={() => window.open(`mailto:${selected.email}`, "_blank")}
                >
                  <Mail className="w-4 h-4 mr-2" /> Send Email
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