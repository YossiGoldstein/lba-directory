import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Shield, User, KeyRound } from "lucide-react";
import { toast } from "sonner";

export default function UsersTab() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [passwordModal, setPasswordModal] = useState(null); // { userId, userName }
  const [newPassword, setNewPassword] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const userList = await base44.entities.User.list();
      return userList.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["all-reviews"],
    queryFn: async () => {
      return await base44.entities.Review.list();
    }
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["all-favorites"],
    queryFn: async () => {
      return await base44.entities.Favorite.list();
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }) => {
      return await base44.entities.User.update(userId, { role: newRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User role updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update user role");
    }
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const getUserReviewCount = (userId) => {
    return reviews.filter(r => r.user_id === userId).length;
  };

  const getUserFavoriteCount = (userId) => {
    return favorites.filter(f => f.user_id === userId).length;
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: { className: "bg-red-600 text-white", icon: Shield },
      user: { className: "bg-gray-500 text-white", icon: User }
    };
    
    const variant = variants[role] || variants.user;
    const Icon = variant.icon;
    
    return (
      <Badge className={variant.className}>
        <Icon className="w-3 h-3 mr-1" />
        {role}
      </Badge>
    );
  };

  const handleRoleChange = (userId, currentEmail, newRole) => {
    if (confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      updateRoleMutation.mutate({ userId, newRole });
    }
  };

  const handleSetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    await base44.entities.User.update(passwordModal.userId, { password_hash: btoa(newPassword) });
    toast.success(`Password set for ${passwordModal.userName}`);
    setPasswordModal(null);
    setNewPassword("");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </p>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Favorites</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Reviews</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Password</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{user.full_name}</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="py-3 px-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {getUserFavoriteCount(user.id)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {getUserReviewCount(user.id)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(user.created_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                   <Select
                     value={user.role}
                     onValueChange={(newRole) => handleRoleChange(user.id, user.email, newRole)}
                   >
                     <SelectTrigger className="w-32">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="user">User</SelectItem>
                       <SelectItem value="admin">Admin</SelectItem>
                     </SelectContent>
                   </Select>
                  </td>
                  <td className="py-3 px-4">
                   {user.role === 'admin' && (
                     <Button
                       size="sm"
                       variant="outline"
                       onClick={() => { setPasswordModal({ userId: user.id, userName: user.full_name }); setNewPassword(""); }}
                     >
                       <KeyRound className="w-3 h-3 mr-1" />
                       Set Password
                     </Button>
                   )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No users found matching your criteria.
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    <Dialog open={!!passwordModal} onOpenChange={() => setPasswordModal(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Password for {passwordModal?.userName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label>New Password</Label>
          <Input
            type="password"
            placeholder="Enter new password..."
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSetPassword()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPasswordModal(null)}>Cancel</Button>
          <Button onClick={handleSetPassword}>Set Password</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}