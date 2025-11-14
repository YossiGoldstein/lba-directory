import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function CategoriesTab() {
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon_name: "",
    is_active: true
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const cats = await base44.entities.Category.list();
      return cats.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }
  });

  const { data: businesses = [] } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      return await base44.entities.Business.list();
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Category.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category created successfully!");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to create category");
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.Category.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category updated successfully!");
      setIsDialogOpen(false);
      setEditingCategory(null);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to update category");
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }) => {
      return await base44.entities.Category.update(id, { is_active: !isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category status updated!");
    },
    onError: () => {
      toast.error("Failed to update category");
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      icon_name: "",
      is_active: true
    });
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      icon_name: category.icon_name || "",
      is_active: category.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        data: formData
      });
    } else {
      createCategoryMutation.mutate(formData);
    }
  };

  const getBusinessCount = (categoryId) => {
    return businesses.filter(b => b.category_id === categoryId).length;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Categories Management</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-700 gap-2" onClick={() => {
                setEditingCategory(null);
                resetForm();
              }}>
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Restaurants"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g., restaurants"
                    required
                  />
                  <p className="text-xs text-gray-500">URL-friendly identifier (lowercase, no spaces)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the category"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon_name">Icon Name</Label>
                  <Input
                    id="icon_name"
                    value={formData.icon_name}
                    onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                    placeholder="e.g., UtensilsCrossed or 🍴"
                  />
                  <p className="text-xs text-gray-500">Lucide icon name or emoji</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                    {editingCategory ? "Update" : "Create"} Category
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-600">
          Total categories: {categories.length} • Active: {categories.filter(c => c.is_active).length}
        </p>

        {/* Categories Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Slug</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Businesses</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {category.icon_name && <span>{category.icon_name}</span>}
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {category.slug}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                    {category.description || "—"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {getBusinessCount(category.id)}
                  </td>
                  <td className="py-3 px-4">
                    {category.is_active ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-500">Hidden</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleActiveMutation.mutate({ id: category.id, isActive: category.is_active })}
                      >
                        {category.is_active ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {categories.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No categories found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}