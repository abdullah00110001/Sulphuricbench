
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Trash2,
  Users,
  GraduationCap,
  Clock
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

interface UserManagementProps {
  userType: 'students' | 'teachers'
}

export function UserManagement({ userType }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', userType, searchTerm],
    queryFn: async () => {
      const roleFilter = userType === 'students' ? 'student' : 'teacher'
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', roleFilter)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      // Apply search filter
      if (searchTerm) {
        return data?.filter((user: any) => 
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        ) || []
      }

      return data || []
    }
  })

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string, action: string }) => {
      let newApprovalStatus: 'approved' | 'pending' | 'rejected' = 'pending'
      
      if (action === 'approve_teacher') {
        newApprovalStatus = 'approved'
      } else if (action === 'reject_teacher') {
        newApprovalStatus = 'rejected'
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ approval_status: newApprovalStatus })
        .eq('id', userId)
        .select()

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast({ title: 'User updated successfully' })
    },
    onError: (error) => {
      toast({ 
        title: 'Error updating user', 
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) {
        throw new Error(error.message)
      }

      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast({ title: 'User deleted successfully' })
    },
    onError: (error) => {
      toast({ 
        title: 'Error deleting user', 
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const approvedUsers = users.filter(user => user.approval_status === 'approved')
  const pendingUsers = users.filter(user => user.approval_status === 'pending')

  if (isLoading) {
    return <div className="animate-pulse">Loading {userType}...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">{userType.charAt(0).toUpperCase() + userType.slice(1)} Management</h2>
          <p className="text-muted-foreground">Manage and moderate {userType}</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={`Search ${userType}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total {userType}</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{approvedUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{pendingUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{userType.charAt(0).toUpperCase() + userType.slice(1)} List</CardTitle>
          <CardDescription>
            {users.length} {userType} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground">{user.role}</p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.email}</p>
                        {user.phone && (
                          <p className="text-sm text-muted-foreground">{user.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(user.approval_status)}
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-2">
                        {user.approval_status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateUserMutation.mutate({
                                userId: user.id,
                                action: 'approve_teacher'
                              })}
                              disabled={updateUserMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserMutation.mutate({
                                userId: user.id,
                                action: 'reject_teacher'
                              })}
                              disabled={updateUserMutation.isPending}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteUserMutation.mutate(user.id)}
                          disabled={deleteUserMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {users.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No {userType} Found</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? `No ${userType} match your search criteria.`
                  : `No ${userType} have registered yet.`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
