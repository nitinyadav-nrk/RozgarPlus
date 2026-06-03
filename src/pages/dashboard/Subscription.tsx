import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMySubscription, useCreateSubscription, getGetMySubscriptionQueryKey } from "@/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Crown, CheckCircle2, Clock, XCircle, QrCode, CalendarCheck } from "lucide-react";

const subscribeSchema = z.object({
  utrNumber: z.string().min(6, "UTR must be at least 6 characters"),
  paymentScreenshot: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
type SubscribeForm = z.infer<typeof subscribeSchema>;

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none gap-1"><CheckCircle2 className="h-3 w-3" /> Active</Badge>;
    case "pending":
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none gap-1"><Clock className="h-3 w-3" /> Pending Review</Badge>;
    case "expired":
      return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none gap-1"><XCircle className="h-3 w-3" /> Expired</Badge>;
    case "rejected":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function Subscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const { data: subscription, isLoading } = useGetMySubscription({ query: { retry: false, queryKey: getGetMySubscriptionQueryKey() } });
  const createSubscription = useCreateSubscription();

  const form = useForm<SubscribeForm>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: { utrNumber: "", paymentScreenshot: "" },
  });

  const onSubmit = (data: SubscribeForm) => {
    createSubscription.mutate(
      { data: { utrNumber: data.utrNumber, paymentScreenshot: data.paymentScreenshot || undefined } },
      {
        onSuccess: () => {
          toast({ title: "Subscription submitted! Awaiting admin approval." });
          queryClient.invalidateQueries({ queryKey: ["getMySubscription"] });
          setShowForm(false);
          form.reset();
        },
        onError: (err: any) => {
          toast({ title: "Failed", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  const canSubscribe =
    !subscription ||
    subscription.status === "rejected" ||
    subscription.status === "expired";

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Crown className="h-7 w-7 text-amber-500" />
          <h1 className="text-3xl font-bold">My Subscription</h1>
        </div>

        {/* Current status card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Annual Membership</CardTitle>
              {isLoading ? (
                <Skeleton className="h-6 w-24 rounded-full" />
              ) : subscription ? (
                <StatusBadge status={subscription.status} />
              ) : (
                <Badge variant="outline">Not Subscribed</Badge>
              )}
            </div>
            <CardDescription>₹21/year — unlimited job applications</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-36" />
              </div>
            ) : subscription ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-medium text-foreground">UTR:</span>
                  <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">{subscription.utrNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-medium text-foreground">Submitted:</span>
                  {new Date(subscription.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                {subscription.status === "active" && subscription.expiresAt && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CalendarCheck className="h-4 w-4" />
                    <span className="font-medium">Valid until:</span>
                    {new Date(subscription.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                )}
                {subscription.status === "pending" && (
                  <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3 text-xs">
                    Your payment is under review. Admin will verify within 24 hours. You can apply to jobs once approved.
                  </p>
                )}
                {subscription.status === "rejected" && (
                  <p className="text-red-700 bg-red-50 border border-red-200 rounded-md p-3 text-xs">
                    Your subscription was rejected. Please re-apply with a valid UTR number.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">You don't have an active subscription. Subscribe to unlock unlimited job applications.</p>
            )}
          </CardContent>
        </Card>

        {/* Benefits card */}
        {(!subscription || subscription.status !== "active") && (
          <Card className="mb-6 border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-emerald-50/50">
            <CardHeader>
              <CardTitle className="text-lg">What you get for ₹21/year</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {[
                  "Apply to unlimited jobs — no per-job fees ever",
                  "Access to all featured and exclusive listings",
                  "Valid for 365 days from activation",
                  "Admin verification within 24 hours",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Subscribe form */}
        {canSubscribe && !showForm && (
          <Button className="w-full" size="lg" onClick={() => setShowForm(true)}>
            <Crown className="h-4 w-4 mr-2" /> Subscribe for ₹21/year
          </Button>
        )}

        {canSubscribe && showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Pay & Subscribe</CardTitle>
              <CardDescription>Scan the QR below, pay ₹21, then enter your UTR number.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-col items-center bg-white border rounded-xl p-5 gap-3">
                <div className="bg-white p-3 border rounded-xl shadow-sm">
                  <QrCode className="w-36 h-36 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-2xl text-primary">₹21</p>
                  <p className="text-sm text-muted-foreground">UPI ID: jobnest@upi</p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="utrNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UTR / Reference Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 123456789012" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentScreenshot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Screenshot URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1" disabled={createSubscription.isPending}>
                      {createSubscription.isPending ? "Submitting…" : "Submit Payment"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
