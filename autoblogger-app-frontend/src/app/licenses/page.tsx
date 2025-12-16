"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateLicense,
  useDeleteLicense,
  useLicenses,
} from "@/queries/licenses";
import { useCurrentUser } from "@/queries/users";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function LicensesPage() {
  const { data: licenses, isLoading, error } = useLicenses();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const createLicense = useCreateLicense();
  const deleteLicense = useDeleteLicense();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [licenseToDelete, setLicenseToDelete] = useState<string | null>(null);
  const [licenseName, setLicenseName] = useState<string>("");
  const [showLicenseKeys, setShowLicenseKeys] = useState(false);
  const [visibleLicenses, setVisibleLicenses] = useState<Set<string>>(
    new Set()
  );

  // Get maxLicenses from the plan information returned by /users/me endpoint
  const maxLicenses = currentUser?.plan?.maximumActiveLicenses || 1;
  const currentPlan = currentUser?.plan?.identifier || "free";
  const planName = currentUser?.plan?.name || "Free";
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

  const confirmDeleteLicense = (licenseId: string) => {
    setLicenseToDelete(licenseId);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteLicense = async () => {
    if (!licenseToDelete) return;

    try {
      await deleteLicense.mutateAsync(licenseToDelete);
      toast.success("License deleted successfully!");
      setIsDeleteModalVisible(false);
      setLicenseToDelete(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete license");
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-destructive">Error loading licenses</p>
      </div>
    );
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-background to-muted/20">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
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
          <div className="mt-2 space-y-1">
            <p className="text-sm text-muted-foreground">
              Current Plan:{" "}
              <span className="font-semibold text-foreground">{planName}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Activated licenses:{" "}
              <span className="font-semibold">{activatedCount}</span> /{" "}
              <span className="font-semibold">{maxLicenses}</span>
              {remainingLicenses > 0 && (
                <span className="text-green-600 dark:text-green-400 ml-2">
                  ({remainingLicenses} remaining)
                </span>
              )}
              {remainingLicenses === 0 && activatedCount > 0 && (
                <span className="text-amber-600 dark:text-amber-400 ml-2">
                  (Limit reached)
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses?.map((license) => {
                  const isVisible =
                    showLicenseKeys || visibleLicenses.has(license.id);
                  const displayKey = isVisible
                    ? license.key
                    : maskLicenseKey(license.key);

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
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => confirmDeleteLicense(license.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
              You can create{" "}
              <span className="font-semibold">{remainingLicenses}</span> more{" "}
              {remainingLicenses === 1 ? "license" : "licenses"} with your
              current plan (<span className="font-semibold">{planName}</span>
              ).
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

      <Dialog
        open={isDeleteModalVisible}
        onOpenChange={setIsDeleteModalVisible}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete License
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this license? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 bg-destructive/10 rounded-md text-sm text-destructive">
            <strong>Warning:</strong> Deleting this license will permanently
            remove it from your account.
            {licenses?.find((l) => l.id === licenseToDelete)?.activated && (
              <span>
                {" "}
                The license is currently activated and may disrupt your service.
              </span>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalVisible(false);
                setLicenseToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteLicense}
              disabled={deleteLicense.isPending}
            >
              Delete License
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
