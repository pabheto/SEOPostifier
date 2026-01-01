"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JsonViewer } from "@/components/ui/json-viewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePipelineContext } from "@/queries/administration";
import { Code, Loader2 } from "lucide-react";
import React from "react";

interface PipelineContextDialogProps {
  interviewId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PipelineContextDialog({
  interviewId,
  open,
  onOpenChange,
}: PipelineContextDialogProps) {
  const { data: pipelineContext, isLoading, error } = usePipelineContext(
    open ? interviewId : null
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>Pipeline Context</DialogTitle>
          <DialogDescription>
            Review the pipeline context for interview {interviewId}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-8rem)] pr-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading pipeline context...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Code className="h-12 w-12 text-destructive mb-4" />
              <p className="text-destructive">Failed to load pipeline context</p>
            </div>
          ) : !pipelineContext ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Code className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No pipeline context available</p>
            </div>
          ) : (
            <Tabs defaultValue="formatted" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="formatted">Formatted View</TabsTrigger>
                <TabsTrigger value="raw">Raw JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="formatted" className="space-y-4">
                <JsonViewer data={pipelineContext} defaultExpanded={false} />
              </TabsContent>
              <TabsContent value="raw" className="space-y-4">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{JSON.stringify(pipelineContext, null, 2)}</code>
                </pre>
              </TabsContent>
            </Tabs>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

