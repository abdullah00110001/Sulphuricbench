
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  FileText, 
  Eye, 
  Save, 
  Gavel,
  Shield,
  Info
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface LegalContent {
  id: string
  type: 'terms' | 'privacy' | 'about'
  title: string
  content: string
  version: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export function LegalContentManager() {
  const [activeTab, setActiveTab] = useState('terms')
  const [editingContent, setEditingContent] = useState<LegalContent | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [version, setVersion] = useState('')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: legalContents = [], isLoading } = useQuery({
    queryKey: ['legal-contents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_content')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return (data || []) as LegalContent[]
    }
  })

  const updateContentMutation = useMutation({
    mutationFn: async (data: { id: string, title: string, content: string, version: string }) => {
      // First deactivate the current active version
      const contentType = editingContent?.type
      if (contentType) {
        await supabase
          .from('legal_content')
          .update({ is_active: false })
          .eq('type', contentType)
          .eq('is_active', true)
      }

      // Insert new version as active
      const { data: newContent, error } = await supabase
        .from('legal_content')
        .insert({
          type: contentType,
          title: data.title,
          content: data.content,
          version: data.version,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error
      return newContent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-contents'] })
      setEditingContent(null)
      setTitle('')
      setContent('')
      setVersion('')
      toast({ title: 'Legal content updated successfully' })
    }
  })

  const getContentByType = (type: string) => {
    return legalContents.find(content => content.type === type)
  }

  const handleEdit = (content: LegalContent) => {
    setEditingContent(content)
    setTitle(content.title)
    setContent(content.content)
    setVersion(content.version)
  }

  const handleSave = () => {
    if (!editingContent || !title || !content || !version) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields',
        variant: 'destructive'
      })
      return
    }

    updateContentMutation.mutate({
      id: editingContent.id,
      title,
      content,
      version
    })
  }

  const getTabIcon = (type: string) => {
    switch (type) {
      case 'terms':
        return <Gavel className="h-4 w-4" />
      case 'privacy':
        return <Shield className="h-4 w-4" />
      case 'about':
        return <Info className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading legal content...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Legal Content Management</h2>
        <p className="text-muted-foreground">Manage Terms of Service, Privacy Policy, and About page content</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="terms" className="flex items-center gap-2">
            {getTabIcon('terms')}
            Terms of Service
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            {getTabIcon('privacy')}
            Privacy Policy
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            {getTabIcon('about')}
            About Us
          </TabsTrigger>
        </TabsList>

        {['terms', 'privacy', 'about'].map((type) => {
          const content = getContentByType(type)
          return (
            <TabsContent key={type} value={type} className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{content?.title}</CardTitle>
                      <CardDescription>
                        Version {content?.version} • Last updated: {content && new Date(content.updated_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{content?.title}</DialogTitle>
                            <DialogDescription>Live preview</DialogDescription>
                          </DialogHeader>
                          {content && (
                            <div 
                              className="prose max-w-none"
                              dangerouslySetInnerHTML={{ __html: content.content }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        size="sm"
                        onClick={() => content && handleEdit(content)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {content && (
                    <div 
                      className="prose max-w-none line-clamp-6"
                      dangerouslySetInnerHTML={{ __html: content.content }}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Edit Modal */}
      <Dialog open={!!editingContent} onOpenChange={(open) => !open && setEditingContent(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editingContent?.title}</DialogTitle>
            <DialogDescription>
              Update the content and version information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
              />
            </div>
            
            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g., 1.1, 2.0"
              />
            </div>
            
            <div>
              <Label htmlFor="content">Content (HTML supported)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Document content"
                rows={15}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={!title || !content || !version || updateContentMutation.isPending}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingContent(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
