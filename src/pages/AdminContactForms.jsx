import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Copy, Trash2, Loader2, FileInput } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

const DEFAULT_FORM = {
  name: "Standard Inquiry",
  is_default: true,
  submit_button_text: "Submit",
  success_headline: "Thank you!",
  success_message: "We'll be in touch within 24 hours.",
  fields: [
    { id: "f_name", field_key: "name", label: "Full Name", type: "text", required: true, order: 0 },
    { id: "f_email", field_key: "email", label: "Email Address", type: "email", required: true, order: 1 },
    { id: "f_phone", field_key: "phone", label: "WhatsApp Number", type: "tel", required: false, order: 2 },
    { id: "f_date", field_key: "wedding_date", label: "Wedding Date", type: "date", required: false, order: 3 },
    { id: "f_venue", field_key: "venue", label: "Venue", type: "text", required: false, order: 4 },
    { id: "f_msg", field_key: "message", label: "Message", type: "textarea", required: false, order: 5 },
  ],
};

export default function AdminContactForms() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);
  const [seeded, setSeeded] = useState(false);

  const { data: forms, isLoading } = useQuery({
    queryKey: ["contactForms"],
    queryFn: () => base44.entities.ContactForm.list("-updated_date"),
    initialData: [],
  });

  useEffect(() => {
    if (!isLoading && forms.length === 0 && !seeded) {
      setSeeded(true);
      base44.entities.ContactForm.create(DEFAULT_FORM).then(f => {
        qc.invalidateQueries({ queryKey: ["contactForms"] });
        navigate(`/admin/contact-forms/${f.id}/edit`);
      });
    }
  }, [isLoading, forms.length]);

  const createMut = useMutation({
    mutationFn: () => base44.entities.ContactForm.create({ name: "New Contact Form", is_default: false, fields: [], submit_button_text: "Submit", success_headline: "Thank you!", success_message: "We'll be in touch." }),
    onSuccess: (f) => { qc.invalidateQueries({ queryKey: ["contactForms"] }); navigate(`/admin/contact-forms/${f.id}/edit`); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.ContactForm.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contactForms"] }); setDeleteId(null); toast({ title: "Form deleted" }); },
  });

  const dupMut = useMutation({
    mutationFn: (f) => {
      const { id, created_date, updated_date, created_by, ...rest } = f;
      return base44.entities.ContactForm.create({ ...rest, name: `${f.name} (Copy)`, is_default: false });
    },
    onSuccess: (f) => { qc.invalidateQueries({ queryKey: ["contactForms"] }); navigate(`/admin/contact-forms/${f.id}/edit`); },
  });

  const setDefault = useMutation({
    mutationFn: async (targetId) => {
      await Promise.all(forms.map(f => base44.entities.ContactForm.update(f.id, { is_default: f.id === targetId })));
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contactForms"] }); toast({ title: "Default form updated" }); },
  });

  const deleteForm = (f) => {
    if (f.is_default) { toast({ title: "Cannot delete the default form", variant: "destructive" }); return; }
    setDeleteId(f.id);
  };

  return (
    <AdminLayout currentPage="AdminContactForms">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-white">Contact Forms</h1>
          <p className="text-white/40 text-sm mt-1">Reusable lead capture forms for landing pages and surveys</p>
        </div>
        <Button onClick={() => createMut.mutate()} disabled={createMut.isPending} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl">
          {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />} Create Contact Form
        </Button>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-20">
          <FileInput className="w-10 h-10 text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-sm">Setting up your default form…</p>
        </div>
      ) : (
        <div className="space-y-3">
          {forms.map(f => (
            <Card key={f.id} className="bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05] transition-colors cursor-pointer" onClick={() => navigate(`/admin/contact-forms/${f.id}/edit`)}>
              <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{f.name}</span>
                    {f.is_default && <Badge className="bg-amber-500/20 text-amber-400">Default</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/30">
                    <span>{(f.fields || []).length} fields</span>
                    <span>{f.updated_date ? formatDistanceToNow(new Date(f.updated_date), { addSuffix: true }) : "—"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/contact-forms/${f.id}/edit`)} className="text-white/40 hover:text-white h-8 px-2"><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => dupMut.mutate(f)} className="text-white/40 hover:text-white h-8 px-2"><Copy className="w-3.5 h-3.5" /></Button>
                  {!f.is_default && <Button size="sm" variant="ghost" onClick={() => setDefault.mutate(f.id)} className="text-white/40 hover:text-white h-8 px-2 text-xs">Set Default</Button>}
                  <Button size="sm" variant="ghost" onClick={() => deleteForm(f)} className="text-red-400/60 hover:text-red-400 h-8 px-2"><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-stone-900 border-white/10 text-white max-w-sm">
          <DialogHeader><DialogTitle>Delete Form?</DialogTitle></DialogHeader>
          <p className="text-white/50 text-sm">This cannot be undone.</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1 border-white/10 text-white">Cancel</Button>
            <Button onClick={() => deleteMut.mutate(deleteId)} disabled={deleteMut.isPending} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
              {deleteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}