import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminListApplications, getAdminListApplicationsQueryKey, useUpdateApplicationStatus } from "@/api-client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, ExternalLink, MessageSquare } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "wouter";

export default function AdminApplications() {
  const { data, isLoading } = useAdminListApplications({}, { query: { queryKey: getAdminListApplicationsQueryKey({}) } });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateStatus = useUpdateApplicationStatus();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<number | null>(null);
  const [action, setAction] = useState<"approved" | "rejected" | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const handleActionClick = (id: number, newAction: "approved" | "rejected") => {
    setSelectedApp(id);
    setAction(newAction);
    setAdminNote("");
    setModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedApp || !action) return;

    updateStatus.mutate(
      { 
        id: selectedApp, 
        data: { status: action, adminNote: adminNote || undefined } 
      },
      {
        onSuccess: () => {
          toast({ title: `Application ${action}` });
          setModalOpen(false);
          queryClient.invalidateQueries({ queryKey: getAdminListApplicationsQueryKey({}) });
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Approved</Badge>;
      case "rejected": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Rejected</Badge>;
      default: return <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">Pending</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Manage Applications</h1>

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Job</TableHead>
                <TableHead>UTR / Payment</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.applications && data.applications.length > 0 ? (
                data.applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="font-medium text-sm">User #{app.userId}</div>
                      <Link href={`/jobs/${app.jobId}`}>
                        <div className="text-sm text-primary hover:underline flex items-center gap-1 cursor-pointer">
                          {app.job.title} <ExternalLink className="h-3 w-3" />
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      {app.utrNumber ? (
                        <div className="font-mono text-xs bg-muted p-1 px-2 rounded inline-block">{app.utrNumber}</div>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">No UTR</span>
                      )}
                      {app.paymentScreenshot && (
                        <div className="mt-1">
                          <a href={app.paymentScreenshot} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                            View Screenshot
                          </a>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {app.resume ? (
                        <a href={app.resume} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                          Link
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(app.status)}
                      {app.adminNote && (
                        <TooltipProvider delayDuration={300}>
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageSquare className="h-3 w-3" /> Note added
                          </div>
                        </TooltipProvider>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {app.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                            onClick={() => handleActionClick(app.id, "approved")}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
                            onClick={() => handleActionClick(app.id, "rejected")}
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approved" ? "Approve Application" : "Reject Application"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">Add a note (optional)</label>
            <Textarea 
              placeholder={`Reason for ${action === "approved" ? "approval" : "rejection"}...`}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button 
              variant={action === "rejected" ? "destructive" : "default"} 
              onClick={handleConfirmAction}
              disabled={updateStatus.isPending}
            >
              Confirm {action === "approved" ? "Approval" : "Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// Simple TooltipProvider wrapper for internal use if missing
function TooltipProvider({ children }: { children: React.ReactNode; delayDuration?: number }) {
  return <>{children}</>;
}
