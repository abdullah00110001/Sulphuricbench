import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Download, FileText } from "lucide-react"
import { InvoiceDownloader } from "./InvoiceDownloader"

export function InvoicesList() {
  const { user, profile } = useAuth()

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['student-invoices', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      // 1) Fetch invoices for this user
      const { data: invoiceRows, error: invErr } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (invErr) throw invErr
      if (!invoiceRows || invoiceRows.length === 0) return []

      // 2) Fetch related course metadata in one call
      const courseIds = Array.from(new Set(invoiceRows.map(i => i.course_id).filter(Boolean))) as string[]
      let coursesById: Record<string, { title: string; thumbnail_url?: string }> = {}

      if (courseIds.length > 0) {
        const { data: courses, error: cErr } = await supabase
          .from('courses')
          .select('id, title, thumbnail_url')
          .in('id', courseIds)
        if (!cErr && courses) {
          coursesById = Object.fromEntries(courses.map(c => [c.id, { title: c.title, thumbnail_url: c.thumbnail_url }]))
        }
      }

      // 3) Merge
      return invoiceRows.map((inv) => ({
        ...inv,
        course: coursesById[inv.course_id as string]
      }))
    },
    enabled: !!user?.id
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-5 w-40 bg-muted rounded mb-3" />
              <div className="h-3 w-56 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Invoices</h3>
          <p className="text-muted-foreground">All invoices issued after payment approval</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No invoices available yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv: any) => (
            <Card key={inv.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={inv.course?.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=64&h=64&fit=crop"}
                    alt={inv.course?.title || 'Course'}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold leading-none">{inv.course?.title || 'Course'}</h4>
                      <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'}>{inv.status || 'paid'}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Invoice #{inv.invoice_number} • {new Date(inv.issued_at || inv.created_at).toLocaleDateString()}</p>
                    {inv.access_code && (
                      <p className="text-xs text-muted-foreground">Access code: {inv.access_code}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">৳{inv.amount}</div>
                  <div className="mt-2">
                    <InvoiceDownloader
                      courseName={inv.course?.title || 'Course'}
                      amount={inv.amount}
                      transactionId={inv.payment_id || inv.id}
                      paymentMethod={inv.payment_id ? 'ONLINE' : 'BKASH_MANUAL'}
                      studentName={profile?.full_name || user?.email?.split('@')[0] || 'Student'}
                      email={user?.email || ''}
                      phone={profile?.phone || ''}
                      invoiceNumber={inv.invoice_number}
                      accessCode={inv.access_code}
                      issuedAt={inv.issued_at || inv.created_at}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
