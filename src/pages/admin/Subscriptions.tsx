import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminListSubscriptions, getAdminListSubscriptionsQueryKey, useAdminUpdateSubscriptionStatus } from "@/api-client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, ExternalLink, Crown, Settings2, Save, IndianRupee, CalendarDays } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "";

function apiUrl(path: string) {
  return `${apiBaseUrl}${path}`;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Active</Badge>;
    case "pending": return <Badge className="bg-amber-50 text-amber-800 border-amber-200" variant="outline">Pending</Badge>;
    case "expired": return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none">Expired</Badge>;
    case "rejected": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Rejected</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

function SettingsPanel() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    subscriptionAmount: "21",
    subscriptionDays: "365",
    upiId: "rozgarplus@upi",
    upiName: "RozgarPlus",
  });

  useEffect(() => {
    const token = localStorage.getItem("rozgarplus_token");
    fetch(apiUrl("/api/admin/settings"), { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setSettings(s => ({ ...s, ...data })); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("rozgarplus_token");
      const res = await fetch(apiUrl("/api/admin/settings"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Settings saved!", description: "Subscription settings updated successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16" />)}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
            <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
            Subscription Amount (₹)
          </label>
          <Input
            type="number"
            min="1"
            value={settings.subscriptionAmount}
            onChange={e => setSettings(s => ({ ...s, subscriptionAmount: e.target.value }))}
            className="h-10"
            placeholder="21"
          />
          <p className="text-xs text-muted-foreground mt-1">Amount users pay via UPI to subscribe</p>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
            Subscription Duration (days)
          </label>
          <Input
            type="number"
            min="1"
            value={settings.subscriptionDays}
            onChange={e => setSettings(s => ({ ...s, subscriptionDays: e.target.value }))}
            className="h-10"
            placeholder="365"
          />
          <p className="text-xs text-muted-foreground mt-1">How long subscription stays active after approval</p>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5">UPI ID</label>
          <Input
            value={settings.upiId}
            onChange={e => setSettings(s => ({ ...s, upiId: e.target.value }))}
            className="h-10 font-mono"
            placeholder="yourname@upi"
          />
          <p className="text-xs text-muted-foreground mt-1">UPI ID shown to users during payment</p>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5">UPI Display Name</label>
          <Input
            value={settings.upiName}
            onChange={e => setSettings(s => ({ ...s, upiName: e.target.value }))}
            className="h-10"
            placeholder="RozgarPlus"
          />
          <p className="text-xs text-muted-foreground mt-1">Name shown on the UPI QR code screen</p>
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Duration applies to new approvals only — existing subscriptions are not affected.
        </p>
      </div>
    </div>
  );
}

export default function AdminSubscriptions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const { data, isLoading } = useAdminListSubscriptions({}, { query: { queryKey: getAdminListSubscriptionsQueryKey({}) } });
  const updateStatus = useAdminUpdateSubscriptionStatus();

  const handleUpdate = (id: number, status: "active" | "rejected") => {
    updateStatus.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast({ title: status === "active" ? "Subscription approved!" : "Subscription rejected" });
          queryClient.invalidateQueries({ queryKey: getAdminListSubscriptionsQueryKey({}) });
        },
        onError: (err: any) => {
          toast({ title: "Failed", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="h-7 w-7 text-amber-500" />
            <div>
              <h1 className="text-2xl font-bold">Subscriptions</h1>
              <p className="text-sm text-muted-foreground">Manage user subscriptions and pricing settings</p>
            </div>
          </div>
          <Button
            variant={showSettings ? "default" : "outline"}
            onClick={() => setShowSettings(s => !s)}
            className="gap-2"
          >
            <Settings2 className="h-4 w-4" />
            {showSettings ? "Hide Settings" : "Manage Settings"}
          </Button>
        </div>

        {showSettings && (
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              Subscription Settings
            </h2>
            <SettingsPanel />
          </div>
        )}

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">All Subscription Requests</h2>
            {data && (
              <span className="text-sm text-muted-foreground">
                {data.total ?? 0} total
              </span>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>UTR Number</TableHead>
                <TableHead>Screenshot</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-24" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.subscriptions && data.subscriptions.length > 0 ? (
                data.subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="font-medium">{sub.userName || `User #${sub.userId}`}</div>
                      <div className="text-xs text-muted-foreground">{sub.userEmail}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs bg-muted p-1 px-2 rounded inline-block">{sub.utrNumber || "—"}</div>
                    </TableCell>
                    <TableCell>
                      {sub.paymentScreenshot ? (
                        <a href={sub.paymentScreenshot} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : <span className="text-muted-foreground text-sm">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(sub.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString("en-IN") : "—"}
                    </TableCell>
                    <TableCell><StatusBadge status={sub.status} /></TableCell>
                    <TableCell className="text-right">
                      {sub.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm"
                            className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                            onClick={() => handleUpdate(sub.id, "active")}
                            disabled={updateStatus.isPending}>
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button variant="outline" size="sm"
                            className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
                            onClick={() => handleUpdate(sub.id, "rejected")}
                            disabled={updateStatus.isPending}>
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No subscription requests yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
