import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, Loader2, Plus, Trash2, GripVertical, ArrowLeft, Type, AlignLeft, Calendar, List, CheckSquare, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const QUESTION_TYPES = [
  { value: "text", label: "Short Text", icon: Type },
  { value: "textarea", label: "Long Text", icon: AlignLeft },
  { value: "date", label: "Date", icon: Calendar },
  { value: "single_select", label: "Single Choice", icon: List },
  { value: "multi_select", label: "Multi Choice", icon: CheckSquare },
];

const BLANK_QUESTION = () => ({
  id: `q_${Date.now()}`,
  field_key: "",
  question: "",
  helper_text: "",
  type: "single_select",
  options: ["Option A", "Option B", "Option C"],
  required: true,
  order: 0,
});

const BLANK_RULE = () => ({
  id: `r_${Date.now()}`,
  name: "",
  conditions: [{ field: "", operator: "equals", value: "" }],
  tags_to_add: [],
});

export default function AdminSurveyEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState(null);
  const [editingQ, setEditingQ] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: survey, isLoading } = useQuery({
    queryKey: ["survey", id],
    queryFn: () => base44.entities.Survey.get(id),
    enabled: !!id,
  });

  const { data: contactForms } = useQuery({
    queryKey: ["contactForms"],
    queryFn: () => base44.entities.ContactForm.list(),
    initialData: [],
  });

  useEffect(() => {
    if (survey && !form) setForm({ ...survey });
  }, [survey]);

  const saveMut = useMutation({
    mutationFn: (data) => base44.entities.Survey.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["survey", id] });
      qc.invalidateQueries({ queryKey: ["surveys"] });
      setSaving(false);
      toast({ title: "Survey saved" });
    },
    onError: (e) => { setSaving(false); toast({ title: "Save failed", description: e?.message, variant: "destructive" }); },
  });

  const handleSave = () => {
    if (!form) return;
    setSaving(true);
    const { id: _id, created_date, updated_date, created_by, ...rest } = form;
    saveMut.mutate(rest);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const qs = Array.from(form.questions || []);
    const [moved] = qs.splice(result.source.index, 1);
    qs.splice(result.destination.index, 0, moved);
    setForm({ ...form, questions: qs.map((q, i) => ({ ...q, order: i })) });
  };

  const addQuestion = () => {
    const q = BLANK_QUESTION();
    q.order = (form.questions || []).length;
    setForm({ ...form, questions: [...(form.questions || []), q] });
    setEditingQ(q.id);
  };

  const updateQuestion = (qId, patch) => {
    setForm({ ...form, questions: form.questions.map(q => q.id === qId ? { ...q, ...patch } : q) });
  };

  const deleteQuestion = (qId) => {
    setForm({ ...form, questions: form.questions.filter(q => q.id !== qId).map((q, i) => ({ ...q, order: i })) });
    if (editingQ === qId) setEditingQ(null);
  };

  const addRule = () => setForm({ ...form, tag_rules: [...(form.tag_rules || []), BLANK_RULE()] });
  const updateRule = (rId, patch) => setForm({ ...form, tag_rules: form.tag_rules.map(r => r.id === rId ? { ...r, ...patch } : r) });
  const deleteRule = (rId) => setForm({ ...form, tag_rules: form.tag_rules.filter(r => r.id !== rId) });

  if (isLoading || !form) {
    return (
      <AdminLayout currentPage="AdminSurveys">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const editingQuestion = form.questions?.find(q => q.id === editingQ);

  return (
    <AdminLayout currentPage="AdminSurveys">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/admin/surveys")} className="text-white/40 hover:text-white p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="bg-transparent border-0 border-b border-white/20 rounded-none text-xl text-white font-light px-0 focus-visible:ring-0 focus-visible:border-amber-500 w-80"
          />
          <Badge className={form.status === "published" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"}>
            {form.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setForm({ ...form, status: form.status === "published" ? "draft" : "published" })} className="border-white/10 text-white/50 hover:text-white rounded-xl">
            {form.status === "published" ? "Unpublish" : "Publish"}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save
          </Button>
        </div>
      </div>

      <Tabs defaultValue="questions">
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger value="questions" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-white/50">Questions</TabsTrigger>
          <TabsTrigger value="end_action" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-white/50">End Action</TabsTrigger>
          <TabsTrigger value="tag_rules" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-white/50">Tags &amp; Routing</TabsTrigger>
        </TabsList>

        <TabsContent value="questions">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 mb-4">
                  {(form.questions || []).map((q, index) => {
                    const TypeIcon = QUESTION_TYPES.find(t => t.value === q.type)?.icon || Type;
                    return (
                      <Draggable key={q.id} draggableId={q.id} index={index}>
                        {(prov) => (
                          <div ref={prov.innerRef} {...prov.draggableProps} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
                            <div {...prov.dragHandleProps} className="text-white/20 hover:text-white/50 cursor-grab">
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <TypeIcon className="w-4 h-4 text-amber-400/60 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-white/80 text-sm truncate">{q.question || "Untitled question"}</p>
                              <p className="text-white/30 text-xs">{QUESTION_TYPES.find(t => t.value === q.type)?.label}{q.required ? " · Required" : ""}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => setEditingQ(q.id)} className="text-white/40 hover:text-white h-7 px-2 text-xs">Edit</Button>
                              <Button size="sm" variant="ghost" onClick={() => deleteQuestion(q.id)} className="text-red-400/50 hover:text-red-400 h-7 px-2"><Trash2 className="w-3.5 h-3.5" /></Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <Button onClick={addQuestion} variant="outline" className="border-dashed border-white/20 text-white/40 hover:text-white rounded-xl w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Question
          </Button>
        </TabsContent>

        <TabsContent value="end_action">
          <Card className="bg-white/[0.03] border-white/[0.06]">
            <CardContent className="p-6 space-y-5">
              <div>
                <Label className="text-white/60 text-xs uppercase tracking-wider mb-3 block">After the last question</Label>
                <div className="space-y-2">
                  {[{ value: "contact_form", label: "Show contact form", desc: "Collect name, email and other details" }, { value: "confirmation_only", label: "Show confirmation only", desc: "Just display a thank-you message" }].map(opt => (
                    <div key={opt.value} onClick={() => setForm({ ...form, end_action: opt.value })}
                      className={`p-4 rounded-xl border cursor-pointer transition-colors ${form.end_action === opt.value ? "border-amber-500 bg-amber-500/10" : "border-white/10 hover:border-white/20"}`}>
                      <p className="text-white text-sm font-medium">{opt.label}</p>
                      <p className="text-white/40 text-xs mt-0.5">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              {form.end_action === "contact_form" && (
                <div>
                  <Label className="text-white/60 text-xs uppercase tracking-wider mb-2 block">Contact Form</Label>
                  {contactForms.length === 0 ? (
                    <p className="text-white/30 text-sm">No contact forms yet — <a href="/admin/contact-forms" target="_blank" className="text-amber-400 underline">create one</a>.</p>
                  ) : (
                    <Select value={form.contact_form_id || ""} onValueChange={v => setForm({ ...form, contact_form_id: v })}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                        <SelectValue placeholder="Select a contact form..." />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-900 border-white/10">
                        {contactForms.map(f => <SelectItem key={f.id} value={f.id} className="text-white">{f.name}{f.is_default ? " (default)" : ""}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <Label className="text-white/60 text-xs uppercase tracking-wider block">Confirmation Screen</Label>
                <div><Label className="text-white/40 text-xs">Headline</Label><Input value={form.confirmation_headline || ""} onChange={e => setForm({ ...form, confirmation_headline: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl" /></div>
                <div><Label className="text-white/40 text-xs">Body Text</Label><Textarea value={form.confirmation_text || ""} onChange={e => setForm({ ...form, confirmation_text: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl" /></div>
                <div><Label className="text-white/40 text-xs">Button Text</Label><Input value={form.confirmation_button_text || ""} onChange={e => setForm({ ...form, confirmation_button_text: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl" /></div>
                <div><Label className="text-white/40 text-xs">Button URL</Label><Input value={form.confirmation_button_url || ""} onChange={e => setForm({ ...form, confirmation_button_url: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl" /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tag_rules">
          <div className="space-y-3 mb-4">
            {(form.tag_rules || []).map(rule => (
              <Card key={rule.id} className="bg-white/[0.03] border-white/[0.06]">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Input value={rule.name} onChange={e => updateRule(rule.id, { name: e.target.value })} placeholder="Rule name" className="bg-white/5 border-white/10 text-white rounded-xl text-sm w-60" />
                    <Button size="sm" variant="ghost" onClick={() => deleteRule(rule.id)} className="text-red-400/50 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                  {(rule.conditions || []).map((cond, ci) => (
                    <div key={ci} className="flex gap-2 items-center">
                      <Input value={cond.field} onChange={e => { const c = [...rule.conditions]; c[ci] = { ...c[ci], field: e.target.value }; updateRule(rule.id, { conditions: c }); }} placeholder="field_key" className="bg-white/5 border-white/10 text-white rounded-xl text-xs flex-1" />
                      <span className="text-white/30 text-xs">equals</span>
                      <Input value={cond.value} onChange={e => { const c = [...rule.conditions]; c[ci] = { ...c[ci], value: e.target.value }; updateRule(rule.id, { conditions: c }); }} placeholder="value" className="bg-white/5 border-white/10 text-white rounded-xl text-xs flex-1" />
                    </div>
                  ))}
                  <div>
                    <Label className="text-white/40 text-xs">Tags to add (comma-separated)</Label>
                    <Input value={(rule.tags_to_add || []).join(", ")} onChange={e => updateRule(rule.id, { tags_to_add: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })} placeholder="luxury, early-bird, local" className="mt-1 bg-white/5 border-white/10 text-white rounded-xl text-sm" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button onClick={addRule} variant="outline" className="border-dashed border-white/20 text-white/40 hover:text-white rounded-xl w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Tag Rule
          </Button>
        </TabsContent>
      </Tabs>

      {editingQuestion && (
        <Dialog open={!!editingQ} onOpenChange={() => setEditingQ(null)}>
          <DialogContent className="bg-stone-900 border-white/10 text-white max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-light">Edit Question</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label className="text-white/50 text-xs uppercase tracking-wider">Question</Label><Input value={editingQuestion.question} onChange={e => updateQuestion(editingQ, { question: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl" /></div>
              <div><Label className="text-white/50 text-xs uppercase tracking-wider">Helper Text</Label><Input value={editingQuestion.helper_text || ""} onChange={e => updateQuestion(editingQ, { helper_text: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl" /></div>
              <div><Label className="text-white/50 text-xs uppercase tracking-wider">Field Key</Label><Input value={editingQuestion.field_key} onChange={e => updateQuestion(editingQ, { field_key: e.target.value.toLowerCase().replace(/\s+/g, "_") })} className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl font-mono text-sm" /></div>
              <div>
                <Label className="text-white/50 text-xs uppercase tracking-wider">Type</Label>
                <Select value={editingQuestion.type} onValueChange={v => updateQuestion(editingQ, { type: v })}>
                  <SelectTrigger className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-stone-900 border-white/10">
                    {QUESTION_TYPES.map(t => <SelectItem key={t.value} value={t.value} className="text-white">{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {(editingQuestion.type === "single_select" || editingQuestion.type === "multi_select") && (
                <div>
                  <Label className="text-white/50 text-xs uppercase tracking-wider">Options</Label>
                  <div className="space-y-2 mt-2">
                    {(editingQuestion.options || []).map((opt, oi) => (
                      <div key={oi} className="flex gap-2">
                        <Input value={opt} onChange={e => { const opts = [...editingQuestion.options]; opts[oi] = e.target.value; updateQuestion(editingQ, { options: opts }); }} className="bg-white/5 border-white/10 text-white rounded-xl text-sm" />
                        <Button size="sm" variant="ghost" onClick={() => { const opts = editingQuestion.options.filter((_, i) => i !== oi); updateQuestion(editingQ, { options: opts }); }} className="text-white/30 hover:text-red-400 px-2"><X className="w-3.5 h-3.5" /></Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => updateQuestion(editingQ, { options: [...(editingQuestion.options || []), "New Option"] })} className="border-dashed border-white/20 text-white/40 hover:text-white rounded-xl w-full text-xs">+ Add Option</Button>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Switch checked={editingQuestion.required} onCheckedChange={v => updateQuestion(editingQ, { required: v })} />
                <Label className="text-white/60 text-sm">Required</Label>
              </div>
              <Button onClick={() => setEditingQ(null)} className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl">Done</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}