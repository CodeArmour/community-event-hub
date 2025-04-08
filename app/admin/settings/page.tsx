"use client"

import { useState } from "react"
import { Search, UserCog, Trash2, Shield, UserIcon, Calendar, Filter, MoreHorizontal, Eye } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockEvents } from "@/lib/mock-data"

// Mock user data
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    avatar: "/placeholder.svg?height=40&width=40&text=JD",
    registeredEvents: ["1", "3", "6"],
    createdAt: "2023-01-15",
    lastLogin: "2023-06-10T09:30:00",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    avatar: "/placeholder.svg?height=40&width=40&text=JS",
    registeredEvents: ["1", "2", "4", "7"],
    createdAt: "2023-02-20",
    lastLogin: "2023-06-09T14:45:00",
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert@example.com",
    role: "user",
    avatar: "/placeholder.svg?height=40&width=40&text=RJ",
    registeredEvents: ["2", "5"],
    createdAt: "2023-03-05",
    lastLogin: "2023-06-08T11:20:00",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@example.com",
    role: "user",
    avatar: "/placeholder.svg?height=40&width=40&text=ED",
    registeredEvents: ["3", "6", "8"],
    createdAt: "2023-03-12",
    lastLogin: "2023-06-10T16:15:00",
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "michael@example.com",
    role: "moderator",
    avatar: "/placeholder.svg?height=40&width=40&text=MW",
    registeredEvents: ["1", "4", "7"],
    createdAt: "2023-04-18",
    lastLogin: "2023-06-09T10:30:00",
  },
  {
    id: "6",
    name: "Sarah Brown",
    email: "sarah@example.com",
    role: "user",
    avatar: "/placeholder.svg?height=40&width=40&text=SB",
    registeredEvents: ["2", "5", "8"],
    createdAt: "2023-05-02",
    lastLogin: "2023-06-08T13:45:00",
  },
  {
    id: "7",
    name: "David Miller",
    email: "david@example.com",
    role: "user",
    avatar: "/placeholder.svg?height=40&width=40&text=DM",
    registeredEvents: [],
    createdAt: "2023-05-20",
    lastLogin: "2023-06-07T09:10:00",
  },
]

export default function AdminSettingsPage() {
  const [users, setUsers] = useState(mockUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<(typeof mockUsers)[0] | null>(null)
  const [showEventsDialog, setShowEventsDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)

  // Filter users based on search query and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  // Get event details for a user
  const getUserEvents = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return []

    return user.registeredEvents.map((eventId) => mockEvents.find((event) => event.id === eventId)).filter(Boolean)
  }

  // Handle role change
  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
    setShowRoleDialog(false)
  }

  // Handle user deletion
  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId))
    setShowDeleteDialog(false)
  }

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500"
      case "moderator":
        return "bg-yellow-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage users, roles, and event registrations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>View and manage all users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Registered Events</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.registeredEvents.length}</span>
                          {user.registeredEvents.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-full px-2 text-xs"
                              onClick={() => {
                                setSelectedUser(user)
                                setShowEventsDialog(true)
                              }}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {new Date(user.lastLogin).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setShowRoleDialog(true)
                              }}
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedUser(user)
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Events Dialog */}
      <Dialog open={showEventsDialog} onOpenChange={setShowEventsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Registered Events for {selectedUser?.name}</DialogTitle>
            <DialogDescription>Events that this user has registered to attend</DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {selectedUser &&
              getUserEvents(selectedUser.id).map((event: any) => (
                <div key={event.id} className="mb-3 flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} • {event.time}
                      </p>
                    </div>
                  </div>
                  <Link href={`/admin/events/${event.id}`}>
                    <Button variant="outline" size="sm">
                      View Event
                    </Button>
                  </Link>
                </div>
              ))}
            {selectedUser && selectedUser.registeredEvents.length === 0 && (
              <div className="flex h-20 items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground">This user hasn't registered for any events</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowEventsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>Update the role for {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Select
                defaultValue={selectedUser?.role}
                onValueChange={(value) => {
                  if (selectedUser) {
                    handleRoleChange(selectedUser.id, value)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-red-500" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="moderator">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-yellow-500" />
                      Moderator
                    </div>
                  </SelectItem>
                  <SelectItem value="user">
                    <div className="flex items-center">
                      <UserIcon className="mr-2 h-4 w-4 text-blue-500" />
                      User
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Note:</span> Changing a user's role will modify their permissions and
                access levels.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedUser) {
                  // Role is already changed in the select onChange
                  setShowRoleDialog(false)
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">
              Deleting this user will remove all their data, including event registrations and profile information.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedUser) {
                  handleDeleteUser(selectedUser.id)
                }
              }}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
