import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Mail, MessageCircle, Send, Plus, Zap } from "lucide-react";

const INTEGRATIONS = [
  {
    icon: FileSpreadsheet,
    name: "Google Sheets",
    description: "Auto-sync every new lead to a Google Sheet for backup and reporting",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Mail,
    name: "Gmail",
    description: "Send automated email sequences to leads based on their status and survey answers",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: MessageCircle,
    name: "WhatsApp",
    description: "Send WhatsApp follow-ups to leads who provided their number",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Send,
    name: "Facebook Messenger",
    description: "Re-engage leads who came from Facebook/Instagram ads via Messenger",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
];

export default function AdminIntegrations() {
  const { data: automations } = useQuery({
    queryKey: ["admin-automations"],
    queryFn: () => base44.entities.AutomationSequence.list(),
    initialData: [],
  });

  const statusColors = {
    active: "bg-green-500/20 text-green-400",
    draft: "bg-white/10 text-white/50",
    paused: "bg-yellow-500/20 text-yellow-400",
    integration_pending: "bg-amber-500/20 text-amber-400",
  };

  return (
    <AdminLayout currentPage="AdminIntegrations">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-white">Integrations</h1>
        <p className="text-white/40 text-sm mt-1">Connect your tools to automate lead follow-up and reporting</p>
      </div>

      {/* Integration Cards */}
      <div className="grid md:grid-cols-2 gap-5 mb-10">
        {INTEGRATIONS.map((integration) => (
          <Card key={integration.name} className="bg-white/[0.03] border-white/[0.06]">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${integration.bg} shrink-0`}>
                  <integration.icon className={`w-6 h-6 ${integration.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium">{integration.name}</h3>
                    <Badge className="bg-white/5 text-white/30 text-[10px]">Coming soon</Badge>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed">{integration.description}</p>
                </div>
              </div>
              <div className="mt-5">
                <Button
                  disabled
                  className="w-full bg-white/5 text-white/30 border border-white/10 rounded-xl cursor-not-allowed"
                  variant="outline"
                >
                  Connect — Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Automation Rules */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-light text-white">Automation Rules</h2>
            <p className="text-white/40 text-xs mt-1">Automated sequences triggered by lead status changes</p>
          </div>
          <Button disabled variant="outline" className="border-white/10 text-white/30 rounded-xl cursor-not-allowed">
            <Plus className="w-4 h-4 mr-2" /> New Automation
            <Badge className="ml-2 bg-white/5 text-white/30 text-[10px]">Soon</Badge>
          </Button>
        </div>

        {automations.length > 0 ? (
          <div className="space-y-3">
            {automations.map(a => (
              <Card key={a.id} className="bg-white/[0.03] border-white/[0.06]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Zap className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">{a.name}</p>
                      <p className="text-white/30 text-xs mt-0.5">Trigger: {a.trigger} · Type: {a.type}</p>
                    </div>
                  </div>
                  <Badge className={statusColors[a.status] || "bg-white/10 text-white/40"}>
                    {a.status?.replace(/_/g, " ")}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white/[0.02] border-white/[0.04]">
            <CardContent className="p-10 text-center">
              <Zap className="w-8 h-8 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No automation rules yet</p>
              <p className="text-white/20 text-xs mt-1">Connect an integration above to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}