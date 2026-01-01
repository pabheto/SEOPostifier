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
import { type ScriptFormatDefinition } from "@/queries/administration";
import { FileText } from "lucide-react";

interface ScriptDefinitionDialogProps {
  interviewId: string;
  scriptDefinition: ScriptFormatDefinition | null | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScriptDefinitionDialog({
  interviewId,
  scriptDefinition,
  open,
  onOpenChange,
}: ScriptDefinitionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle className="break-words whitespace-normal">
            Script Definition
          </DialogTitle>
          <DialogDescription className="break-words whitespace-normal">
            Review the script definition for interview {interviewId}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-8rem)] pr-4">
          {!scriptDefinition ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No script definition available
              </p>
            </div>
          ) : (
            <div className="space-y-6 break-words">
              {/* Index Summary */}
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold mb-2 break-words whitespace-normal">
                  Index Summary
                </h2>
                <p className="text-muted-foreground break-words whitespace-normal">
                  {scriptDefinition.indexSummary}
                </p>
              </div>

              {/* Head Section */}
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold mb-4 break-words whitespace-normal">
                  Head
                </h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium mb-1 break-words whitespace-normal">
                      H1 Title
                    </h3>
                    <p className="text-muted-foreground break-words whitespace-normal">
                      {scriptDefinition.head.h1}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1 break-words whitespace-normal">
                      Slug
                    </h3>
                    <p className="text-muted-foreground font-mono text-sm break-all">
                      {scriptDefinition.head.slug}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1 break-words whitespace-normal">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {scriptDefinition.head.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="break-words max-w-full whitespace-normal"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1 break-words whitespace-normal">
                      Introduction Description
                    </h3>
                    <p className="text-muted-foreground break-words whitespace-normal">
                      {scriptDefinition.head.introductionDescription}
                    </p>
                  </div>
                  {scriptDefinition.head.introductionLengthRange && (
                    <div>
                      <h3 className="font-medium mb-1 break-words whitespace-normal">
                        Introduction Length Range
                      </h3>
                      <p className="text-muted-foreground break-words whitespace-normal">
                        {scriptDefinition.head.introductionLengthRange[0]} -{" "}
                        {scriptDefinition.head.introductionLengthRange[1]} words
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Body Sections */}
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold mb-4 break-words whitespace-normal">
                  Body Sections
                </h2>
                <div className="space-y-6">
                  {scriptDefinition.body.sections.map((section, index) => (
                    <div
                      key={section.id || index}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="secondary" className="shrink-0">
                          {section.level.toUpperCase()}
                        </Badge>
                        <h3 className="text-lg font-semibold break-words whitespace-normal flex-1 min-w-0">
                          {section.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground mb-3 break-words whitespace-normal">
                        {section.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Length Range: </span>
                          <span className="text-muted-foreground">
                            {section.lengthRange[0]} - {section.lengthRange[1]}{" "}
                            words
                          </span>
                        </div>
                        {section.requiresDeepResearch && (
                          <div>
                            <Badge variant="outline">
                              Requires Deep Research
                            </Badge>
                          </div>
                        )}
                      </div>
                      {section.links && section.links.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {section.links.some(
                            (link) => link.type === "internal"
                          ) && (
                            <div>
                              <span className="font-medium text-sm break-words">
                                Internal Links:{" "}
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {section.links
                                  .filter((link) => link.type === "internal")
                                  .map((link, linkIndex) => (
                                    <Badge
                                      key={linkIndex}
                                      variant="outline"
                                      className="text-xs break-all max-w-full whitespace-normal"
                                    >
                                      {link.url} - {link.description}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          )}
                          {section.links.some(
                            (link) => link.type === "external"
                          ) && (
                            <div>
                              <span className="font-medium text-sm break-words">
                                External Links:{" "}
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {section.links
                                  .filter((link) => link.type === "external")
                                  .map((link, linkIndex) => (
                                    <Badge
                                      key={linkIndex}
                                      variant="outline"
                                      className="text-xs break-all max-w-full whitespace-normal"
                                    >
                                      {link.url} - {link.description}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {section.images && section.images.length > 0 && (
                        <div className="mt-3">
                          <span className="font-medium text-sm">Images: </span>
                          <span className="text-muted-foreground text-sm">
                            {section.images.length} image(s)
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Section */}
              {scriptDefinition.faq && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 break-words whitespace-normal">
                    FAQ Section
                  </h2>
                  <div className="border rounded-lg p-4">
                    <p className="text-muted-foreground mb-3 break-words whitespace-normal">
                      {scriptDefinition.faq.description}
                    </p>
                    {scriptDefinition.faq.lengthRange && (
                      <div className="text-sm break-words">
                        <span className="font-medium">Length Range: </span>
                        <span className="text-muted-foreground">
                          {scriptDefinition.faq.lengthRange[0]} -{" "}
                          {scriptDefinition.faq.lengthRange[1]} words
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
