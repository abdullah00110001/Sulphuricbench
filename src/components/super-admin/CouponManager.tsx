
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Plus, Percent } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface Coupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_percentage: number
  discount_amount: number
  valid_from: string
  valid_until: string
  usage_limit: number
  usage_count: number
  is_active: boolean
  minimum_amount: number
  description: string
  applicable_courses: string[]
}

export function CouponManager() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_percentage: 10,
    discount_amount: 0,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usage_limit: 100,
    minimum_amount: 0,
    description: '',
    is_active: true,
    applicable_courses: [] as string[]
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch coupons using edge function to bypass RLS
  const { data: coupons, isLoading, refetch } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('manage-coupons', {
        body: {
          action: 'get_all',
          superAdminEmail: 'abdullahusimin1@gmail.com' // This should come from auth
        }
      })

      if (error) throw error
      return data?.data || []
    }
  })

  // Create coupon mutation
  const createMutation = useMutation({
    mutationFn: async (couponData: typeof formData) => {
      const { data, error } = await supabase.functions.invoke('manage-coupons', {
        body: {
          action: 'create',
          superAdminEmail: 'abdullahusimin1@gmail.com', // This should come from auth
          data: {
            ...couponData,
            code: couponData.code.toUpperCase()
          }
        }
      })

      if (error) throw error
      if (!data.success) throw new Error(data.error)
      return data.data
    },
    onSuccess: () => {
      toast({ title: 'Coupon created successfully!' })
      setShowCreateForm(false)
      resetForm()
      refetch()
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create coupon',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // Delete coupon mutation
  const deleteMutation = useMutation({
    mutationFn: async (couponId: string) => {
      const { data, error } = await supabase.functions.invoke('manage-coupons', {
        body: {
          action: 'delete',
          superAdminEmail: 'abdullahusimin1@gmail.com', // This should come from auth
          couponId
        }
      })

      if (error) throw error
      if (!data.success) throw new Error(data.error)
      return data.data
    },
    onSuccess: () => {
      toast({ title: 'Coupon deleted successfully!' })
      refetch()
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete coupon',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_percentage: 10,
      discount_amount: 0,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usage_limit: 100,
      minimum_amount: 0,
      description: '',
      is_active: true,
      applicable_courses: []
    })
    setEditingCoupon(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.code.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Coupon code is required',
        variant: 'destructive'
      })
      return
    }

    createMutation.mutate(formData)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Coupon Management</h2>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Loading...
          </Button>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Coupon Management</h2>
        <Button 
          onClick={() => setShowCreateForm(true)}
          disabled={showCreateForm}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Coupon
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Coupon</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="SAVE10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_type">Discount Type</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value: 'percentage' | 'fixed') => 
                      setFormData(prev => ({ ...prev, discount_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.discount_type === 'percentage' ? (
                  <div className="space-y-2">
                    <Label htmlFor="discount_percentage">Discount Percentage *</Label>
                    <Input
                      id="discount_percentage"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        discount_percentage: parseInt(e.target.value) || 0 
                      }))}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="discount_amount">Discount Amount (৳) *</Label>
                    <Input
                      id="discount_amount"
                      type="number"
                      min="1"
                      value={formData.discount_amount}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        discount_amount: parseFloat(e.target.value) || 0 
                      }))}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="usage_limit">Usage Limit *</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    min="1"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      usage_limit: parseInt(e.target.value) || 1 
                    }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valid_from">Valid From *</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valid_until">Valid Until *</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimum_amount">Minimum Order Amount (৳)</Label>
                  <Input
                    id="minimum_amount"
                    type="number"
                    min="0"
                    value={formData.minimum_amount}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      minimum_amount: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for the coupon"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Coupon'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Coupons List */}
      <div className="grid gap-4">
        {coupons?.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Percent className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No coupons yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first coupon to get started with discounts.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Coupon
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          coupons?.map((coupon: Coupon) => (
            <Card key={coupon.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{coupon.code}</h3>
                      <Badge variant={coupon.is_active ? "default" : "secondary"}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">
                        {coupon.discount_type === 'percentage' 
                          ? `${coupon.discount_percentage}% OFF`
                          : `৳${coupon.discount_amount} OFF`
                        }
                      </Badge>
                    </div>
                    
                    {coupon.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {coupon.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Valid:</span><br />
                        {formatDate(coupon.valid_from)} - {formatDate(coupon.valid_until)}
                      </div>
                      <div>
                        <span className="font-medium">Usage:</span><br />
                        {coupon.usage_count} / {coupon.usage_limit}
                      </div>
                      {coupon.minimum_amount > 0 && (
                        <div>
                          <span className="font-medium">Min Amount:</span><br />
                          ৳{coupon.minimum_amount}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Status:</span><br />
                        <Badge variant={coupon.usage_count >= coupon.usage_limit ? "destructive" : "default"}>
                          {coupon.usage_count >= coupon.usage_limit ? 'Expired' : 'Available'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(coupon.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
