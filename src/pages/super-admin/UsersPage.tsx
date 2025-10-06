
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Users, GraduationCap, BookOpen, Shield, Eye, Calendar, MapPin, Globe, Phone, Mail } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher' | 'super_admin'>('all')
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users', searchTerm, roleFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(error.message)
      }

      // Apply search filter
      if (searchTerm) {
        return data.filter((user: any) => 
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      return data
    }
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-red-100 text-red-800"><Shield className="w-3 h-3 mr-1" />Super Admin</Badge>
      case 'teacher':
        return <Badge className="bg-blue-100 text-blue-800"><GraduationCap className="w-3 h-3 mr-1" />Teacher</Badge>
      case 'student':
        return <Badge className="bg-green-100 text-green-800"><BookOpen className="w-3 h-3 mr-1" />Student</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getApprovalStatus = (status: string) => {
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

  if (isLoading) {
    return <div className="animate-pulse">Loading users...</div>
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            Users & Students Management
          </h1>
          <p className="text-muted-foreground">Manage all platform users including students and teachers</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="super_admin">Super Admins</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-brand-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-brand-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">All Users</p>
                <p className="text-2xl font-bold text-brand-primary">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-brand-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-brand-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {users.filter(user => user.role === 'student').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-brand-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-brand-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Teachers</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {users.filter(user => user.role === 'teacher').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-brand-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-brand-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Super Admins</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {users.filter(user => user.role === 'super_admin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
          <CardDescription>
            Manage and view all platform users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  
                  <TableCell>
                    {getApprovalStatus(user.approval_status)}
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline">{user.points || 0} pts</Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {users.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
              <p className="text-gray-600">
                {searchTerm || roleFilter !== 'all'
                  ? 'No users match your search criteria.'
                  : 'No users have been registered yet.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information about {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedUser.avatar_url} />
                  <AvatarFallback className="text-xl">
                    {selectedUser.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <h3 className="text-2xl font-bold">{selectedUser.full_name}</h3>
                  <div className="flex gap-2">
                    {getRoleBadge(selectedUser.role)}
                    {getApprovalStatus(selectedUser.approval_status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {formatDistanceToNow(new Date(selectedUser.created_at), { addSuffix: true })}
                    </div>
                    <Badge variant="outline">{selectedUser.points || 0} points</Badge>
                    <Badge variant="outline">Level {selectedUser.level || 1}</Badge>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </h4>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedUser.email}</p>
                </div>
                
                {selectedUser.phone && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </h4>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedUser.phone}</p>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedUser.location && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </h4>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedUser.location}</p>
                  </div>
                )}
                
                {selectedUser.website_url && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </h4>
                    <a 
                      href={selectedUser.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline bg-gray-50 p-2 rounded block"
                    >
                      {selectedUser.website_url}
                    </a>
                  </div>
                )}
              </div>

              {/* Bio */}
              {selectedUser.bio && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Bio</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded leading-relaxed">
                    {selectedUser.bio}
                  </p>
                </div>
              )}

              {/* Social Links */}
              {selectedUser.social_links && Object.keys(selectedUser.social_links).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Social Links</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedUser.social_links).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline bg-gray-50 p-2 rounded capitalize"
                      >
                        {platform}: {url as string}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <strong>Account Created:</strong><br />
                  {new Date(selectedUser.created_at).toLocaleString()}
                </div>
                {selectedUser.last_sign_in_at && (
                  <div>
                    <strong>Last Sign In:</strong><br />
                    {new Date(selectedUser.last_sign_in_at).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
