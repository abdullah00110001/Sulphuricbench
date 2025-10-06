import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit2, Save, X } from "lucide-react"
import { toast } from "sonner"

interface FAQ {
  id: string
  category: string
  question: string
  answer: string
  display_order: number
  is_active: boolean
}

const categories = ["Payment", "Refunds", "Course Access", "Technical Support"]

export default function FAQPage() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newFAQ, setNewFAQ] = useState({
    category: "Payment",
    question: "",
    answer: "",
    display_order: 0,
    is_active: true
  })

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('category')
        .order('display_order')
      
      if (error) throw error
      return data as FAQ[]
    }
  })

  const addMutation = useMutation({
    mutationFn: async (faq: typeof newFAQ) => {
      const { error } = await supabase
        .from('faqs')
        .insert([faq])
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] })
      queryClient.invalidateQueries({ queryKey: ['faqs'] })
      toast.success("FAQ added successfully")
      setNewFAQ({
        category: "Payment",
        question: "",
        answer: "",
        display_order: 0,
        is_active: true
      })
    },
    onError: () => {
      toast.error("Failed to add FAQ")
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FAQ> & { id: string }) => {
      const { error } = await supabase
        .from('faqs')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] })
      queryClient.invalidateQueries({ queryKey: ['faqs'] })
      toast.success("FAQ updated successfully")
      setEditingId(null)
    },
    onError: () => {
      toast.error("Failed to update FAQ")
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] })
      queryClient.invalidateQueries({ queryKey: ['faqs'] })
      toast.success("FAQ deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete FAQ")
    }
  })

  const handleAdd = () => {
    if (!newFAQ.question || !newFAQ.answer) {
      toast.error("Question and answer are required")
      return
    }
    addMutation.mutate(newFAQ)
  }

  const handleUpdate = (faq: FAQ) => {
    updateMutation.mutate(faq)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return <div className="p-8">Loading FAQs...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">FAQ Management</h1>
        <p className="text-muted-foreground">Manage frequently asked questions displayed on the website</p>
      </div>

      {/* Add New FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New FAQ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newFAQ.category} onValueChange={(value) => setNewFAQ({ ...newFAQ, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={newFAQ.display_order}
                onChange={(e) => setNewFAQ({ ...newFAQ, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Question</Label>
            <Input
              value={newFAQ.question}
              onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
              placeholder="Enter the question"
            />
          </div>
          <div className="space-y-2">
            <Label>Answer</Label>
            <Textarea
              value={newFAQ.answer}
              onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
              placeholder="Enter the answer"
              rows={4}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={newFAQ.is_active}
              onCheckedChange={(checked) => setNewFAQ({ ...newFAQ, is_active: checked })}
            />
            <Label>Active</Label>
          </div>
          <Button onClick={handleAdd} disabled={addMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Add FAQ
          </Button>
        </CardContent>
      </Card>

      {/* FAQ List by Category */}
      {categories.map(category => {
        const categoryFAQs = faqs?.filter(f => f.category === category) || []
        
        if (categoryFAQs.length === 0) return null

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryFAQs.map(faq => (
                <div key={faq.id} className="border rounded-lg p-4 space-y-3">
                  {editingId === faq.id ? (
                    <EditFAQForm
                      faq={faq}
                      onSave={handleUpdate}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Order: {faq.display_order}</span>
                            {!faq.is_active && (
                              <span className="text-xs bg-muted px-2 py-1 rounded">Inactive</span>
                            )}
                          </div>
                          <h4 className="font-semibold">{faq.question}</h4>
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingId(faq.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(faq.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function EditFAQForm({ 
  faq, 
  onSave, 
  onCancel 
}: { 
  faq: FAQ
  onSave: (faq: FAQ) => void
  onCancel: () => void
}) {
  const [editedFAQ, setEditedFAQ] = useState(faq)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={editedFAQ.category} onValueChange={(value) => setEditedFAQ({ ...editedFAQ, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Display Order</Label>
          <Input
            type="number"
            value={editedFAQ.display_order}
            onChange={(e) => setEditedFAQ({ ...editedFAQ, display_order: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Question</Label>
        <Input
          value={editedFAQ.question}
          onChange={(e) => setEditedFAQ({ ...editedFAQ, question: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Answer</Label>
        <Textarea
          value={editedFAQ.answer}
          onChange={(e) => setEditedFAQ({ ...editedFAQ, answer: e.target.value })}
          rows={4}
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={editedFAQ.is_active}
          onCheckedChange={(checked) => setEditedFAQ({ ...editedFAQ, is_active: checked })}
        />
        <Label>Active</Label>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => onSave(editedFAQ)}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  )
}
