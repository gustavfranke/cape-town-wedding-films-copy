import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Sparkles, Pencil, Copy, Trash2, Eye, Loader2, ClipboardList } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

function statusColor(s) {
  return s === "published" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40";
}

export default function AdminSurveys() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { data: surveys } = useQuery({
    queryKey: ["surveys"],
    queryFn: () => base44.entities.Survey.list("-updated_date"),
    initialData: [],
  });

  const { data: contactForms } = useQuery({
    queryKey: ["contactForms"],
    queryFn: () => base44.entities.ContactForm.list(),
    initialData: [],
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Survey.create(data),
    onSuccess: (s) => { qc.invalidateQueries({ queryKey: ["surveys"] }); navigate(`/admin/surveys/${s.id}/edit`); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Survey.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["surveys"] }); setDeleteId(null); toast({ title: "Survey deleted" }); },
  });

  const dupMut = useMutation({
    mutationFn: async (s) => {
      const { id, created_date, updated_date, created_by, ...rest } = s;
      return base44.entities.Survey.create({ ...rest, name: `${s.name} (Copy)`, status: "draft" });
    },
    onSuccess: (s) => { qc.invalidateQueries({ queryKey: ["surveys"] }); navigate(`/admin/surveys/${s.id}/edit`); },
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Survey.update(id, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["surveys"] }); toast({ title: "Status updated" }); },
  });

  const handleCreateBlank = () => {
    createMut.mutate({ name: "Untitled Survey", status: "draft", questions: [], end_action: "contact_form", tag_rules: [] });
  };

  const handleCreateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 6-8 qualification quiz questions for the following lead type: "${aiPrompt}". 
Make questions feel premium, considered, and specific to this business. 
Return a JSON object with a "questions" array. Each question must have: 
- question (string): the question text
- helper_text (string, optional): short supporting text
- field_key (string): snake_case identifier
- type (string): one of "text", "date", "single_select", "multi_select"
- options (array of strings): required if type is single_select or multi_select (4-6 options)
- required (boolean)`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  helper_text: { type: "string" },
                  field_key: { type: "string" },
                  type: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  required: { type: "boolean" }
                }
              }
            }
          }
        }
      });
      const questions = (result.questions || []).map((q, i) => ({ ...q, id: `q_${Date.now()}_${i}`, order: i }));
      setAiOpen(false);
      setAiPrompt("");
      createMut.mutate({ name: `AI Survey — ${aiPrompt.slice(0, 40)}`, status: "draft", questions, end_action: "contact_form", tag_rules: [] });
    } catch (e) {
      toast({ title: "AI generation failed", description: e?.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const cfName = (cfId) => contactForms.find(f => f.id === cfId)?.name || "None";

  return (
    <AdminLayout currentPage="AdminSurveys">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-light text-white">Surveys</h1>
          <p className="text-white/40 text-sm mt-1">Build qualification quizzes for your landing pages</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAiOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl">
            <Sparkles className="w-4 h-4 mr-2" /> Create with AI
          </Button>
          <Button onClick={handleCreateBlank} disabled={createMut.isPending} variant="outline" className="border-white/10 text-white/60 hover:text-white rounded-xl">
            {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />} Create Blank
          </Button>
        </div>
      </div>

      {surveys.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardList className="w-10 h-10 text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-sm mb-1">No surveys yet</p>
          <p className="text-white/20 text-xs">Click "Create with AI" to generate one in seconds, or "Create Blank" to start from scratch.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {surveys.map(s => (
            <Card key={s.id} className="bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05] transition-colors cursor-pointer" onClick={() => navigate(`/admin/surveys/${s.id}/edit`)}>
              <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{s.name}</span>
                    <Badge className={statusColor(s.status)}>{s.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/30">
                    <span>{(s.questions || []).length} questions</span>
                    <span>Form: {s.end_action === "contact_form" ? cfName(s.contact_form_id) : "Confirmation only"}</span>
                    <span>{s.updated_date ? formatDistanceToNow(new Date(s.updated_date), { addSuffix: true }) : "—"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/surveys/${s.id}/edit`)} className="text-white/40 hover:text-white h-8 px-2">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => dupMut.mutate(s)} className="text-white/40 hover:text-white h-8 px-2">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleStatus.mutate({ id: s.id, status: s.status === "published" ? "draft" : "published" })} className="text-white/40 hover:text-white h-8 px-2 text-xs">
                    {s.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(s.id)} className="text-red-400/60 hover:text-red-400 h-8 px-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Create Modal */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="bg-stone-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-light flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-400" /> Create Survey with AI</DialogTitle>
          </DialogHeader>
          <p className="text-white/50 text-sm">Describe what you want to qualify — the AI will generate tailored questions.</p>
          <Textarea
            placeholder="e.g. Wedding videography leads — budget, date, style preferences, planning stage"
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            className="bg-white/5 border-white/10 text-white rounded-xl min-h-[100px] mt-2"
          />
          <Button onClick={handleCreateWithAI} disabled={aiLoading || !aiPrompt.trim()} className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl mt-2">
            {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating…</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Questions</>}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-stone-900 border-white/10 text-white max-w-sm">
          <DialogHeader><DialogTitle>Delete Survey?</DialogTitle></DialogHeader>
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