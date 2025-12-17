"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type PostInterview } from "@/queries/administration";
import { FileText } from "lucide-react";

interface InterviewParamsDialogProps {
  interview: PostInterview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InterviewParamsDialog({
  interview,
  open,
  onOpenChange,
}: InterviewParamsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>Post Interview Parameters</DialogTitle>
          <DialogDescription>
            View all parameters for this post interview
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-8rem)] pr-4">
          {!interview ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No interview data available
              </p>
            </div>
          ) : (
            <div className="bg-muted rounded-lg p-4">
              <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap wrap-break-word">
                {JSON.stringify(interview, null, 2)}
              </pre>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
