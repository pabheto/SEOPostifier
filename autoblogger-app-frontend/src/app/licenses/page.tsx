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
import { CheckCircle2, Copy, Key, XCircle, Plus, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function LicensesPage() {
  const { data: licenses, isLoading, error } = useLicenses();
  const { data: subscriptionData } = useSubscription();
  const createLicense = useCreateLicense();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [licenseName, setLicenseName] = useState<string>("");
  const [showLicenseKeys, setShowLicenseKeys] = useState(false);
  const [visibleLicenses, setVisibleLicenses] = useState<Set<string>>(new Set());

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
  const activatedLicenses = licenses?.filter((l) => l.activated) || [];
  const activatedCount = activatedLicenses.length;
  const remainingLicenses = Math.max(0, maxLicenses - activatedCount);

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

  const toggleLicenseVisibility = (licenseId: string) => {
    setVisibleLicenses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(licenseId)) {
        newSet.delete(licenseId);
      } else {
        newSet.add(licenseId);
      }
      return newSet;
    });
  };

  const maskLicenseKey = (key: string) => {
    return "*".repeat(key.length);
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
              Activated licenses: <span className="font-semibold">{activatedCount}</span> / {maxLicenses}
              {remainingLicenses > 0 && (
                <span className="text-green-600 dark:text-green-400 ml-2">
                  ({remainingLicenses} remaining)
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowLicenseKeys(!showLicenseKeys)}
            size="lg"
          >
            {showLicenseKeys ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {showLicenseKeys ? "Hide Keys" : "Show Keys"}
          </Button>
          <Button
            onClick={() => setIsModalVisible(true)}
            disabled={remainingLicenses === 0}
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create License
          </Button>
        </div>
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
                  <TableHead>Activated Site</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses?.map((license) => {
                  const isVisible = showLicenseKeys || visibleLicenses.has(license.id);
                  const displayKey = isVisible ? license.key : maskLicenseKey(license.key);
                  
                  return (
                    <TableRow key={license.id}>
                      <TableCell>
                        <div className="flex gap-2">
                          <Input
                            readOnly
                            value={displayKey}
                            className="font-mono bg-muted"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleLicenseVisibility(license.id)}
                          >
                            {isVisible ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
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
                          variant={license.activated ? "default" : "secondary"}
                        >
                          {license.activated ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {license.activated ? "Activated" : "Not Activated"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {license.activated && license.activatedForSite ? (
                          <a
                            href={license.activatedForSite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {license.activatedForSite}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Not activated
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">
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
                          </span>
                          {license.activated && license.activatedAt && (
                            <span className="text-xs text-muted-foreground">
                              Activated:{" "}
                              {new Date(license.activatedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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

