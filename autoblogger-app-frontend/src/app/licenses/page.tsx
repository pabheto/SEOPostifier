"use client";

import { useCreateLicense, useLicenses } from "@/queries/licenses";
import { useSubscription } from "@/queries/subscriptions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Copy, Key, XCircle, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function LicensesPage() {
  const { data: licenses, isLoading, error } = useLicenses();
  const { data: subscriptionData } = useSubscription();
  const createLicense = useCreateLicense();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [licenseName, setLicenseName] = useState<string>("");

  const subscription = subscriptionData?.subscription;
  const currentPlan = subscription?.plan || "free";

  // Plan limits for maximum active licenses
  const planLimits: Record<string, number> = {
    free: 1,
    basic: 1,
    premium: 1,
    agency: 1,
  };

  const maxLicenses = planLimits[currentPlan] || 1;
  const activeLicenses = licenses?.filter((l) => l.active) || [];
  const activeCount = activeLicenses.length;
  const remainingLicenses = Math.max(0, maxLicenses - activeCount);

  const handleCreateLicense = async () => {
    if (!licenseName.trim()) {
      toast.error("Please enter a license name");
      return;
    }
    try {
      await createLicense.mutateAsync({ name: licenseName.trim() });
      toast.success("License created successfully!");
      setIsModalVisible(false);
      setLicenseName("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create license");
    }
  };

  const handleCopyLicense = (licenseKey: string) => {
    navigator.clipboard.writeText(licenseKey);
    toast.success("License key copied to clipboard!");
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-destructive">Error loading licenses</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-background to-muted/20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Licenses</h2>
          <p className="text-muted-foreground text-base">
            Manage your license keys
          </p>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              Active licenses: <span className="font-semibold">{activeCount}</span> / {maxLicenses}
              {remainingLicenses > 0 && (
                <span className="text-green-600 dark:text-green-400 ml-2">
                  ({remainingLicenses} remaining)
                </span>
              )}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsModalVisible(true)}
          disabled={remainingLicenses === 0}
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create License
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Key</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses?.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={license.key}
                          className="font-mono bg-muted"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleCopyLicense(license.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {license.name || "Unnamed License"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={license.active ? "default" : "destructive"}
                      >
                        {license.active ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {license.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {license.createdAt
                        ? new Date(license.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalVisible} onOpenChange={setIsModalVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Create New License
            </DialogTitle>
            <DialogDescription>
              Enter a name for your new license key.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-2">
                License Name:
              </label>
              <Input
                placeholder="Enter a name for this license"
                value={licenseName}
                onChange={(e) => setLicenseName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateLicense();
                  }
                }}
                maxLength={100}
              />
            </div>
            <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
              You can create <span className="font-semibold">{remainingLicenses}</span> more{" "}
              {remainingLicenses === 1 ? "license" : "licenses"} with your current
              plan (<span className="font-semibold">{currentPlan.toUpperCase()}</span>).
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalVisible(false);
                setLicenseName("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateLicense}
              disabled={createLicense.isPending}
            >
              Create License
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

