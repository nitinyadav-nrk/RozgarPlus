import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminListPayments, getAdminListPaymentsQueryKey, useVerifyPayment } from "@/api-client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function AdminPayments() {
  const { data, isLoading } = useAdminListPayments({}, { query: { queryKey: getAdminListPaymentsQueryKey({}) } });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const verifyPayment = useVerifyPayment();

  const handleVerify = (id: number, status: "approved" | "rejected") => {
    verifyPayment.mutate(
      { id, data: { paymentStatus: status } },
      {
        onSuccess: () => {
          toast({ title: `Payment marked as ${status}` });
          queryClient.invalidateQueries({ queryKey: getAdminListPaymentsQueryKey({}) });
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Verified</Badge>;
      case "rejected": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Rejected</Badge>;
      default: return <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">Pending</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Payment Verification</h1>

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>UTR Number</TableHead>
                <TableHead>Screenshot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.payments && data.payments.length > 0 ? (
                data.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="font-medium">{payment.userName || `User #${payment.userId}`}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm line-clamp-1 max-w-[200px]">
                        {payment.jobTitle || `App #${payment.applicationId}`}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">₹{payment.amount}</TableCell>
                    <TableCell>
                      <div className="font-mono text-xs bg-muted p-1 px-2 rounded inline-block">{payment.utrNumber}</div>
                    </TableCell>
                    <TableCell>
                      {payment.screenshot ? (
                        <a href={payment.screenshot} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.paymentStatus)}
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.paymentStatus === "pending" && (
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                            onClick={() => handleVerify(payment.id, "approved")}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Verify
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
                            onClick={() => handleVerify(payment.id, "rejected")}
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
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No payments found.
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
