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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, Loader2, Plus, Trash2, GripVertical, ArrowLeft, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const FIELD_TYPES = ["text", "email", "tel", "date", "textarea", "select"];

const BLANK_FIELD = () => ({
  id: `ff_${Date.now()}`,
  field_key: "",
  label: "",
  placeholder: "",
  type: "text",
  options: [],
  required: false,
  order: 0,
});

export default function AdminContactFormEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState(null);
  const [editingF, setEditingF] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: cf, isLoading } = useQuery({
    queryKey: ["contactForm", id],
    queryFn: () => base44.entities.ContactForm.get(id),
    enabled: !!id,
  });

  useEffect(() => { if (cf && !form) setForm({ ...cf }); }, [cf]);

  const saveMut = useMutation({
    mutationFn: (data) => base44.entities.ContactForm.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contactForm", id] });
      qc.invalidateQueries({ queryKey: ["contactForms"] });
      setSaving(false);
      toast({ title: "Form saved" });
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
    const fields = Array.from(form.fields || []);
    const [moved] = fields.splice(result.source.index, 1);
    fields.splice(result.destination.index, 0, moved);
    setForm({ ...form, fields: fields.map((f, i) => ({ ...f, order: i })) });
  };

  const addField = () => {
    const f = BLANK_FIELD();
    f.order = (form.fields || []).length;
    setForm({ ...form, fields: [...(form.fields || []), f] });
    setEditingF(f.id);
  };

  const updateField = (fId, patch) => setForm({ ...form, fields: form.fields.map(f => f.id === fId ? { ...f, ...patch } : f) });
  const deleteField = (fId) => { setForm({ ...form, fields: form.fields.filter(f => f.id !== fId).map((f, i) => ({ ...f, order: i })) }); if (editingF === fId) setEditingF(null); };

  const editingField = form?.fields?.find(f => f.id === editingF);

  if (isLoading || !form) {
    return <AdminLayout currentPage="AdminContactForms"><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div></AdminLayout>;
  }

  return (
    <AdminLayout currentPage="AdminContactForms">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/admin/contact-forms")} className="text-white/40 hover:text-white p-2"><ArrowLeft className="w-4 h-4" /></Button>
          <Input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="bg-transparent border-0 border-b border-white/20 rounded-none text-xl text-white font-light px-0 focus-visible:ring-0 focus-visible:border-amber-500 w-80"
          />
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Fields */}
        <div>
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Form Fields</h3>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 mb-3">
                  {(form.fields || []).map((f, index) => (
                    <Draggable key={f.id} draggableId={f.id} index={index}>
                      {(prov) => (
                        <div ref={prov.innerRef} {...prov.draggableProps} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">
                          <div {...prov.dragHandleProps} className="text-white/20 hover:text-white/50 cursor-grab"><GripVertical className="w-4 h-4" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/80 text-sm truncate">{f.label || f.field_key || "Untitled field"}</p>
                            <p className="text-white/30 text-xs">{f.type} {f.required ? "· Required" : ""}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setEditingF(f.id)} className="text-white/40 hover:text-white h-7 px-2 text-xs">Edit</Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteField(f.id)} className="text-red-400/50 hover:text-red-400 h-7 px-2"><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <Button onClick={addField} variant="outline" className="border-dashed border-white/20 text-white/40 hover:text-white rounded-xl w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Field
          </Button>
        </div>

        {/* Config */}
        <div className="space-y-5">
          <Card className="bg-white/[0.03] border-white/[0.06]">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-white/60 text-xs uppercase tracking-wider">Submit Button</h3>
              <div><Label className="text-white/40 text-xs">Button Text</Label><Input value={form.submit_button_text || ""} onChange={e => setForm({ ...form, submit_button_text: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl" /></div>
            </CardContent>
          </Card>
          <Card className="bg-white/[0.03] border-white/[0.06]">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-white/60 text-xs uppercase tracking-wider">Success Screen</h3>
              <div><Label className="text-white/40 text-xs">Headline</Label><Input value={form.success_headline || ""} onChange={e => setForm({ ...form, success_headline: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl" /></div>
              <div><Label className="text-white/40 text-xs">Message</Label><Textarea value={form.success_message || ""} onChange={e => setForm({ ...form, success_message: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl" /></div>
              <div><Label className="text-white/40 text-xs">Button Text (optional)</Label><Input value={form.success_button_text || ""} onChange={e => setForm({ ...form, success_button_text: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl" /></div>
              <div><Label className="text-white/40 text-xs">Button URL (optional)</Label><Input value={form.success_button_url || ""} onChange={e => setForm({ ...form, success_button_url: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl" /></div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Field Edit Dialog */}
      {editingField && (
        <Dialog open={!!editingF} onOpenChange={() => setEditingF(null)}>
          <DialogContent className="bg-stone-900 border-white/10 text-white max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-light">Edit Field</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label className="text-white/50 text-xs uppercase tracking-wider">Label</Label><Input value={editingField.label} onChange={e => updateField(editingF, { label: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl" /></div>
              <div><Label className="text-white/50 text-xs uppercase tracking-wider">Field Key (maps to Lead)</Label><Input value={editingField.field_key} onChange={e => updateField(editingF, { field_key: e.target.value.toLowerCase().replace(/\s+/g, "_") })} placeholder="name, email, phone, wedding_date, venue, message" className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl font-mono text-sm" /></div>
              <div><Label className="text-white/50 text-xs uppercase tracking-wider">Placeholder</Label><Input value={editingField.placeholder || ""} onChange={e => updateField(editingF, { placeholder: e.target.value })} className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl" /></div>
              <div>
                <Label className="text-white/50 text-xs uppercase tracking-wider">Type</Label>
                <Select value={editingField.type} onValueChange={v => updateField(editingF, { type: v })}>
                  <SelectTrigger className="mt-1.5 bg-white/5 border-white/10 text-white rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-stone-900 border-white/10">
                    {FIELD_TYPES.map(t => <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {editingField.type === "select" && (
                <div>
                  <Label className="text-white/50 text-xs uppercase tracking-wider">Options</Label>
                  <div className="space-y-2 mt-2">
                    {(editingField.options || []).map((opt, oi) => (
                      <div key={oi} className="flex gap-2">
                        <Input value={opt} onChange={e => { const opts = [...editingField.options]; opts[oi] = e.target.value; updateField(editingF, { options: opts }); }} className="bg-white/5 border-white/10 text-white rounded-xl text-sm" />
                        <Button size="sm" variant="ghost" onClick={() => updateField(editingF, { options: editingField.options.filter((_, i) => i !== oi) })} className="text-white/30 hover:text-red-400 px-2"><X className="w-3.5 h-3.5" /></Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => updateField(editingF, { options: [...(editingField.options || []), ""] })} className="border-dashed border-white/20 text-white/40 rounded-xl w-full text-xs">+ Add Option</Button>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Switch checked={editingField.required} onCheckedChange={v => updateField(editingF, { required: v })} />
                <Label className="text-white/60 text-sm">Required</Label>
              </div>
              <Button onClick={() => setEditingF(null)} className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl">Done</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}