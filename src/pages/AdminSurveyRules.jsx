import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Save } from "lucide-react";

const DEFAULT_RULES = [
  {
    id: "r1",
    name: "Early Stage Lead",
    conditions: [{ field: "planning_stage", operator: "equals", value: "Just starting" }],
    actions: [{ type: "add_tag", value: "Early Stage" }]
  },
  {
    id: "r2",
    name: "Vault Requested",
    conditions: [{ field: "vault_interest", operator: "equals", value: "Yes, send it to me" }],
    actions: [{ type: "add_tag", value: "Vault Requested" }]
  },
  {
    id: "r3",
    name: "Large Wedding",
    conditions: [{ field: "guest_count", operator: "equals", value: "200+" }],
    actions: [{ type: "add_tag", value: "Large Wedding" }]
  },
  {
    id: "r4",
    name: "Winelands Wedding",
    conditions: [{ field: "wedding_setting", operator: "equals", value: "Winelands estate" }],
    actions: [{ type: "add_tag", value: "Winelands" }]
  }
];

export default function AdminSurveyRules() {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const qc = useQueryClient();

  const { data: config } = useQuery({
    queryKey: ["survey-config-rules"],
    queryFn: async () => {
      const configs = await base44.entities.SurveyConfig.filter({ config_key: "rules" });
      if (configs.length === 0) {
        const newConfig = await base44.entities.SurveyConfig.create({
          config_key: "rules",
          rules: DEFAULT_RULES
        });
        return newConfig;
      }
      return configs[0];
    },
  });

  const updateMut = useMutation({
    mutationFn: (rules) => base44.entities.SurveyConfig.update(config.id, { rules }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["survey-config-rules"] });
      setEditing(null);
    },
  });

  const rules = config?.rules || [];

  const handleSave = () => {
    const updatedRules = editing.id
      ? rules.map(r => r.id === editing.id ? form : r)
      : [...rules, { ...form, id: `r${Date.now()}` }];
    updateMut.mutate(updatedRules);
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this rule?")) return;
    updateMut.mutate(rules.filter(r => r.id !== id));
  };

  const handleAddRule = () => {
    setForm({
      name: "New Rule",
      conditions: [{ field: "", operator: "equals", value: "" }],
      actions: [{ type: "add_tag", value: "" }]
    });
    setEditing({});
  };

  return (
    <AdminLayout currentPage="AdminSurvey">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-white">Survey Rules &amp; Tags</h1>
          <p className="text-white/40 text-sm mt-1">Auto-tag leads based on their survey answers</p>
        </div>
        <Button onClick={handleAddRule} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Add Rule
        </Button>
      </div>

      <div className="space-y-4">
        {rules.length === 0 && (
          <div className="text-center py-12 text-white/30">
            <p>No rules yet — click "Add Rule" to get started</p>
          </div>
        )}
        {rules.map(rule => (
          <Card key={rule.id} className="bg-white/[0.03] border-white/[0.06]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-white text-sm font-medium">{rule.name}</CardTitle>
                <p className="text-white/30 text-xs mt-2">
                  {rule.conditions.map(c => `${c.field} ${c.operator} "${c.value}"`).join(" AND ")}
                  {" → "}
                  {rule.actions.map(a => a.value).join(", ")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { setForm(rule); setEditing(rule); }} variant="outline" size="sm" className="border-white/10 text-white/60 hover:text-white">
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button onClick={() => handleDelete(rule.id)} variant="outline" size="sm" className="border-white/10 text-red-400 hover:text-red-300">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="bg-stone-900 border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white font-light">{editing?.id ? "Edit Rule" : "New Rule"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div>
              <Label className="text-white/60 text-xs">Rule Name</Label>
              <Input
                value={form.name || ""}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="mt-2 bg-white/5 border-white/10 text-white rounded-xl"
              />
            </div>
            <div>
              <Label className="text-white/60 text-xs">Conditions</Label>
              {(form.conditions || []).map((cond, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 mt-2">
                  <Input
                    placeholder="Field"
                    value={cond.field}
                    onChange={e => {
                      const updated = [...form.conditions];
                      updated[i] = { ...cond, field: e.target.value };
                      setForm({ ...form, conditions: updated });
                    }}
                    className="bg-white/5 border-white/10 text-white rounded-xl"
                  />
                  <Select value={cond.operator} onValueChange={v => {
                    const updated = [...form.conditions];
                    updated[i] = { ...cond, operator: v };
                    setForm({ ...form, conditions: updated });
                  }}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Value"
                    value={cond.value}
                    onChange={e => {
                      const updated = [...form.conditions];
                      updated[i] = { ...cond, value: e.target.value };
                      setForm({ ...form, conditions: updated });
                    }}
                    className="bg-white/5 border-white/10 text-white rounded-xl"
                  />
                </div>
              ))}
            </div>
            <div>
              <Label className="text-white/60 text-xs">Actions (Tags)</Label>
              {(form.actions || []).map((action, i) => (
                <div key={i} className="mt-2">
                  <Input
                    placeholder="Tag name"
                    value={action.value}
                    onChange={e => {
                      const updated = [...form.actions];
                      updated[i] = { ...action, value: e.target.value };
                      setForm({ ...form, actions: updated });
                    }}
                    className="bg-white/5 border-white/10 text-white rounded-xl"
                  />
                </div>
              ))}
            </div>
            <Button onClick={handleSave} disabled={updateMut.isPending} className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-5">
              <Save className="w-4 h-4 mr-2" /> Save Rule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}