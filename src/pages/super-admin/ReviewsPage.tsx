import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, Check, X, Eye, Trash2 } from 'lucide-react'
import { reviewsApi, Review } from '@/apis/reviews'
import { useToast } from '@/hooks/use-toast'

export default function ReviewsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: reviewsApi.getAllReviews
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string, approved: boolean }) => 
      reviewsApi.updateReviewStatus(id, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['approved-reviews'] })
      toast({ title: "Success", description: "Review status updated!" })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: reviewsApi.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['approved-reviews'] })
      toast({ title: "Success", description: "Review deleted!" })
    }
  })

  const handleApprove = (id: string) => {
    approveMutation.mutate({ id, approved: true })
  }

  const handleReject = (id: string) => {
    approveMutation.mutate({ id, approved: false })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      deleteMutation.mutate(id)
    }
  }

  const pendingReviews = reviews.filter(r => r.is_approved === false)
  const approvedReviews = reviews.filter(r => r.is_approved === true)

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading reviews...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review Management</h1>
        <p className="text-muted-foreground">
          Manage student reviews and testimonials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingReviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedReviews.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending ({pendingReviews.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedReviews.length})</TabsTrigger>
          <TabsTrigger value="all">All Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <ReviewTable 
            reviews={pendingReviews}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
            showActions
          />
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <ReviewTable 
            reviews={approvedReviews}
            onReject={handleReject}
            onDelete={handleDelete}
            showActions
          />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <ReviewTable 
            reviews={reviews}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
            showActions
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ReviewTable({ 
  reviews, 
  onApprove, 
  onReject, 
  onDelete, 
  showActions = false 
}: {
  reviews: Review[]
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onDelete?: (id: string) => void
  showActions?: boolean
}) {
  if (!reviews.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No reviews found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              {showActions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{review.user_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {review.user_role}{review.user_company ? ` at ${review.user_company}` : ''}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-1 text-sm">({review.rating})</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-md">
                    <p className="text-sm line-clamp-3">{review.review_text}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={review.is_approved ? "default" : "secondary"}>
                    {review.is_approved ? 'Approved' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </TableCell>
                {showActions && (
                  <TableCell>
                    <div className="flex gap-1">
                      {!review.is_approved && onApprove && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => onApprove(review.id!)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {review.is_approved && onReject && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => onReject(review.id!)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => onDelete(review.id!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}