"use client";

import { useState, useEffect } from "react";
import {
  Search,
  UserCog,
  Trash2,
  Shield,
  UserIcon,
  Calendar,
  Filter,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockEvents } from "@/lib/mock-data";
import {
  getUsers,
  getUserRegistrations,
  updateUserRole,
  deleteUser,
} from "@/actions/settings";
import { toast } from "@/components/ui/toast";

export default function AdminSettingsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showEventsDialog, setShowEventsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  // Load users on page load
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const userData = await getUsers();
        setUsers(userData);
      } catch (error) {
        toast.error({
          title: "Error",
          description: "Failed to load users",
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Filter users based on search query and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      user.role?.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  // Get event details for a user
  const getUserEvents = async (userId: string) => {
    try {
      setEventsLoading(true);
      const registrations = await getUserRegistrations(userId);
      setUserEvents(registrations);
    } catch (error) {
      toast.error({
        title: "Error",
        description: "Failed to load user events",
      });
      console.error(error);
    } finally {
      setEventsLoading(false);
    }
  };

  // Handle role change
  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRole) return;
    
    try {
      await updateUserRole({ userId: selectedUser.id, role: selectedRole.toUpperCase() });
      
      // Update local state with the new role (properly cased)
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id ? { ...user, role: selectedRole.toUpperCase() } : user
        )
      );
      
      toast.success({
        title: "Success",
        description: "User role updated successfully",
      });
      setShowRoleDialog(false);
    } catch (error) {
      toast.error({
        title: "Error",
        description: "Failed to update user role",
      });
      console.error(error);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      setUsers(users.filter((user) => user.id !== userId));
      toast.success({
        title: "Success",
        description: "User deleted successfully",
      });
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error({
        title: "Error",
        description: "Failed to delete user",
      });
      console.error(error);
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "bg-red-500";
      case "MODERATOR":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  // Format role for display
  const formatRole = (role: string) => {
    return role
      ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
      : "User";
  };

  // Initialize selected role when opening the dialog
  const openRoleDialog = (user: any) => {
    setSelectedUser(user);
    setSelectedRole(user.role.toLowerCase());
    setShowRoleDialog(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and event registrations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            View and manage all users in the system
          </CardDescription>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback>
                              {user.name
                                ? user.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.name || "Unnamed User"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getRoleBadgeColor(
                            user.role
                          )} text-white`}
                        >
                          {formatRole(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {user.registeredEventsCount || 0}
                          </span>
                          {user.registeredEventsCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-full px-2 text-xs"
                              onClick={() => {
                                setSelectedUser(user);
                                getUserEvents(user.id);
                                setShowEventsDialog(true);
                              }}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => openRoleDialog(user)}
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteDialog(true);
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
            <DialogTitle>
              Registered Events for {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              Events that this user has registered to attend
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {eventsLoading ? (
              <div className="flex h-20 items-center justify-center">
                <p>Loading events...</p>
              </div>
            ) : userEvents.length > 0 ? (
              userEvents.map((registration: any) => (
                <div
                  key={registration.id}
                  className="mb-3 flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{registration.event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(registration.event.date).toLocaleDateString()}{" "}
                        • {registration.event.time}
                      </p>
                      <Badge className="mt-1" variant="outline">
                        {registration.status}
                      </Badge>
                    </div>
                  </div>
                  <Link href={`/admin/events/${registration.event.id}`}>
                    <Button variant="outline" size="sm">
                      View Event
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="flex h-20 items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground">
                  This user hasn't registered for any events
                </p>
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
            <DialogDescription>
              Update the role for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value)}
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
                  <SelectItem value="user">
                    <div className="flex items-center">
                      <UserIcon className="mr-2 h-4 w-4 text-blue-500" />
                      User
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Note:</span> Changing a user's
                role will modify their permissions and access levels.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange}>
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
              Are you sure you want to delete {selectedUser?.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">
              Deleting this user will remove all their data, including event
              registrations and profile information.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedUser) {
                  handleDeleteUser(selectedUser.id);
                }
              }}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}