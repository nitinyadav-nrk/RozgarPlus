import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminListUsers, getAdminListUsersQueryKey, useToggleUserBlock } from "@/api-client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const { data, isLoading } = useAdminListUsers({}, { query: { queryKey: getAdminListUsersQueryKey({}) } });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const toggleBlock = useToggleUserBlock();

  const handleToggleBlock = (id: number, currentBlocked: boolean) => {
    toggleBlock.mutate(
      { id, data: { isBlocked: !currentBlocked } },
      {
        onSuccess: () => {
          toast({ title: `User ${!currentBlocked ? "blocked" : "unblocked"} successfully` });
          queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey({}) });
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Manage Users</h1>

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Details</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.users && data.users.length > 0 ? (
                data.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{user.email}</div>
                      {user.phone && <div className="text-xs text-muted-foreground">{user.phone}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {user.isBlocked ? (
                        <Badge variant="destructive">Blocked</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.role !== "admin" && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                          className={user.isBlocked ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-destructive hover:text-destructive hover:bg-destructive/10"}
                        >
                          {user.isBlocked ? (
                            <><ShieldCheck className="h-4 w-4 mr-2" /> Unblock</>
                          ) : (
                            <><ShieldAlert className="h-4 w-4 mr-2" /> Block</>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No users found.
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
