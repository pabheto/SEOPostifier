"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import React from "react";

interface ScriptTextDialogProps {
  interviewId: string;
  scriptText: string | null | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScriptTextDialog({
  interviewId,
  scriptText,
  open,
  onOpenChange,
}: ScriptTextDialogProps) {
  const parseLinks = (text: string): React.ReactNode => {
    if (!text) return text;

    // Regex to match URLs - matches http://, https://, www., or domain patterns
    const urlRegex =
      /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+|[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(?:\/[^\s<>"']*)?)/g;

    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match;
    let matchCount = 0;

    // Reset regex lastIndex to avoid issues with global regex
    urlRegex.lastIndex = 0;

    while ((match = urlRegex.exec(text)) !== null) {
      // Add text before the URL
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Get the matched URL
      let url = match[0];

      // Remove trailing punctuation that's likely not part of the URL
      const trailingPunctuation = /[.,;:!?]+$/;
      const punctuationMatch = url.match(trailingPunctuation);
      let trailingPunct = "";
      if (punctuationMatch) {
        trailingPunct = punctuationMatch[0];
        url = url.replace(trailingPunctuation, "");
      }

      // Add protocol if missing
      let href = url;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        href = `https://${url}`;
      }

      // Validate that it's a valid URL
      try {
        new URL(href);
        parts.push(
          <React.Fragment key={`link-${matchCount++}`}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {url}
            </a>
            {trailingPunct}
          </React.Fragment>
        );
      } catch {
        // If URL is invalid, just add as text
        parts.push(match[0]);
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>Script Text</DialogTitle>
          <DialogDescription>
            Review the script text for interview {interviewId}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-8rem)] pr-4">
          {!scriptText ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No script text available</p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-base leading-relaxed">
                {parseLinks(scriptText)}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
