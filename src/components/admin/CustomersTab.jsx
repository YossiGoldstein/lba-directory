import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Mail, Phone, Calendar, CheckCircle, XCircle, Trash2, Key, Eye, EyeOff, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function CustomersTab() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [passwordModal, setPasswordModal] = useState(null); // { customer }
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.Customer.list();
      setCustomers(data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    } catch (error) {
      console.error("Failed to load customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (customer) => {
    try {
      await base44.entities.Customer.update(customer.id, {
        is_active: !customer.is_active
      });
      toast.success(`Customer ${customer.is_active ? 'deactivated' : 'activated'} successfully`);
      loadCustomers();
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast.error("Failed to update customer status");
    }
  };

  const handleDeleteCustomer = async (customer) => {
    if (!confirm(`Are you sure you want to delete ${customer.full_name}?`)) return;
    
    try {
      await base44.entities.Customer.delete(customer.id);
      toast.success("Customer deleted successfully");
      loadCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);
      toast.error("Failed to delete customer");
    }
  };

  const handleSetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSavingPassword(true);
    try {
      const passwordHash = btoa(newPassword);
      await base44.entities.Customer.update(passwordModal.customer.id, { password_hash: passwordHash });
      toast.success("Password updated successfully");
      setPasswordModal(null);
      setNewPassword("");
    } catch (error) {
      toast.error("Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const query = searchQuery.toLowerCase();
    return (
      customer.full_name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="inline-block w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Registered Customers</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Customers who registered through the website
            </p>
          </div>
          <Badge className="bg-cyan-600 text-white text-lg px-4 py-2">
            {customers.length} Total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-600">
          Showing {filteredCustomers.length} of {customers.length} customers
        </p>

        {/* Customers Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Registered</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{customer.full_name}</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <a href={`mailto:${customer.email}`} className="hover:text-cyan-600">
                      {customer.email}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {customer.phone ? (
                      <a href={`tel:${customer.phone}`} className="hover:text-cyan-600">
                        {customer.phone}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={customer.is_active ? "bg-green-600" : "bg-red-600"}>
                      {customer.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(customer.created_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                     <Button
                       size="sm"
                       variant="ghost"
                       onClick={() => handleToggleStatus(customer)}
                       title={customer.is_active ? "Deactivate" : "Activate"}
                     >
                       {customer.is_active ? (
                         <XCircle className="w-4 h-4" />
                       ) : (
                         <CheckCircle className="w-4 h-4" />
                       )}
                     </Button>
                     <Button
                       size="sm"
                       variant="ghost"
                       onClick={() => { setPasswordModal({ customer }); setNewPassword(""); }}
                       className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                       title="Set Password"
                     >
                       <Key className="w-4 h-4" />
                     </Button>
                     <Button
                       size="sm"
                       variant="ghost"
                       onClick={() => handleDeleteCustomer(customer)}
                       className="text-red-600 hover:text-red-700 hover:bg-red-50"
                       title="Delete"
                     >
                       <Trash2 className="w-4 h-4" />
                     </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No customers found matching your criteria.
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Password Modal */}
    {passwordModal && (
      <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Set Password</h3>
            <button onClick={() => setPasswordModal(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Setting password for: <strong>{passwordModal.customer.full_name}</strong> ({passwordModal.customer.email})
          </p>
          <div className="relative mb-4">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New password (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setPasswordModal(null)}>Cancel</Button>
            <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={handleSetPassword} disabled={savingPassword}>
              {savingPassword ? "Saving..." : "Save Password"}
            </Button>
          </div>
        </div>
      </div>
    )}
  );
}