"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, Trash } from "lucide-react";
import React from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type DeleteButtonProps = {
  resource?: string;
  recordItemId?: string;
  size?: "sm" | "md" | "lg" | "icon" | "default";
  hidden?: boolean;
  onSuccess?: () => void;
} & React.ComponentProps<typeof Button>;

export const DeleteButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  DeleteButtonProps
>(({ resource = "blog-posts", recordItemId, size = "sm", hidden, onSuccess, children, ...rest }, ref) => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  if (hidden) return null;

  const handleDelete = async () => {
    if (!recordItemId) return;
    
    setLoading(true);
    try {
      await apiClient.delete(`/${resource}/${recordItemId}`);
      toast.success("Item deleted successfully");
      setOpen(false);
      router.refresh();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span>
          <Button
            variant="destructive"
            {...rest}
            ref={ref}
            size={size}
            disabled={loading || rest.disabled}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children ?? (
              <div className="flex items-center gap-2 font-semibold">
                <Trash className="h-4 w-4" />
                <span>Delete</span>
              </div>
            )}
          </Button>
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto" align="start">
        <div className="flex flex-col gap-2">
          <p className="text-sm">Are you sure you want to delete this item?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={loading}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

DeleteButton.displayName = "DeleteButton";
