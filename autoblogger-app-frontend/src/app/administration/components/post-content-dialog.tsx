"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { usePostContent, type PostBlock } from "@/queries/administration";
import { FileText } from "lucide-react";
import React from "react";

interface PostContentDialogProps {
  interviewId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostContentDialog({
  interviewId,
  open,
  onOpenChange,
}: PostContentDialogProps) {
  const {
    data: postContent,
    isLoading,
    error,
  } = usePostContent(open ? interviewId : null);

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

  const renderBlock = (block: PostBlock, index: number) => {
    switch (block.type) {
      case "heading":
        const HeadingTag = block.level || "h2";
        const headingClasses = {
          h1: "text-3xl font-bold mt-8 mb-4",
          h2: "text-2xl font-semibold mt-6 mb-3",
          h3: "text-xl font-semibold mt-5 mb-2",
          h4: "text-lg font-medium mt-4 mb-2",
        };
        return (
          <div key={index} className={headingClasses[HeadingTag]}>
            {block.title}
          </div>
        );

      case "paragraph":
        return (
          <div key={index} className="mb-4 text-base leading-relaxed">
            {parseLinks(block.content || "")}
          </div>
        );

      case "image":
        return (
          <div key={index} className="my-6">
            {block.image?.sourceValue ? (
              <img
                src={block.image.sourceValue}
                alt={block.image.alt || block.image.title || "Image"}
                className="w-full rounded-lg border"
              />
            ) : (
              <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center border">
                <span className="text-muted-foreground">Image placeholder</span>
              </div>
            )}
            {block.image?.title && (
              <p className="text-sm text-muted-foreground mt-2">
                {block.image.title}
              </p>
            )}
          </div>
        );

      case "faq":
        return (
          <div key={index} className="my-6 border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">FAQ</h3>
            <div className="space-y-4">
              {block.questions?.map((question, qIndex) => (
                <div key={qIndex} className="space-y-2">
                  <h4 className="font-medium text-base">{question}</h4>
                  {block.answers?.[qIndex] && (
                    <p className="text-muted-foreground text-sm pl-4">
                      {parseLinks(block.answers[qIndex])}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>Post Content</DialogTitle>
          <DialogDescription>
            Review the generated content for this post interview
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-8rem)] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-destructive mb-4" />
              <p className="text-destructive">Error loading post content</p>
            </div>
          ) : postContent ? (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h1 className="text-3xl font-bold mb-2">{postContent.title}</h1>
                <div className="flex flex-wrap gap-2 mt-3">
                  {postContent.mainKeyword && (
                    <Badge variant="default">
                      Keyword: {postContent.mainKeyword}
                    </Badge>
                  )}
                  {postContent.language && (
                    <Badge variant="outline">
                      Language: {postContent.language.toUpperCase()}
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    Status: {postContent.status}
                  </Badge>
                </div>
                {postContent.secondaryKeywords &&
                  postContent.secondaryKeywords.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        Secondary keywords:{" "}
                        {postContent.secondaryKeywords.join(", ")}
                      </p>
                    </div>
                  )}
              </div>

              <div className="prose prose-sm max-w-none">
                {postContent.blocks && postContent.blocks.length > 0 ? (
                  postContent.blocks.map((block, index) =>
                    renderBlock(block, index)
                  )
                ) : (
                  <p className="text-muted-foreground">
                    No content blocks available
                  </p>
                )}
              </div>

              <div className="border-t pt-4 mt-6 text-sm text-muted-foreground">
                <p>
                  Created:{" "}
                  {new Date(postContent.createdAt).toLocaleString("en-US")}
                </p>
                <p>
                  Updated:{" "}
                  {new Date(postContent.updatedAt).toLocaleString("en-US")}
                </p>
              </div>
            </div>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
