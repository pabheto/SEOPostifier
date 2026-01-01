"use client";

import { DataTablePagination } from "@/components/refine-ui/data-table/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  usePostInterviews,
  type PostInterview,
} from "@/queries/administration";
import {
  ChevronDown,
  Code,
  Eye,
  FileCode,
  FileText,
  FileType,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { InterviewParamsDialog } from "./interview-params-dialog";
import { PipelineContextDialog } from "./pipeline-context-dialog";
import { PostContentDialog } from "./post-content-dialog";
import { ScriptDefinitionDialog } from "./script-definition-dialog";
import { ScriptTextDialog } from "./script-text-dialog";

type DialogType =
  | "post"
  | "scriptDefinition"
  | "scriptText"
  | "pipelineContext"
  | "interviewParams"
  | null;

export function PostInterviewsTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, error } = usePostInterviews(page, pageSize);
  const [selectedInterview, setSelectedInterview] =
    useState<PostInterview | null>(null);
  const [openDialog, setOpenDialog] = useState<DialogType>(null);

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Error loading post interviews</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Post Interviews</CardTitle>
          <CardDescription>
            Review all post interviews and their generated content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Interview ID</TableHead>
                  <TableHead>Main Keyword</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.data && data.data.length > 0 ? (
                  data.data.map((interview) => (
                    <TableRow key={interview.interviewId}>
                      <TableCell className="font-mono text-sm">
                        {interview.interviewId.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">
                        {interview.mainKeyword}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{interview.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {interview.language?.toUpperCase() || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(interview.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {interview.associatedPostId && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedInterview(interview);
                                  setOpenDialog("post");
                                }}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Read Post
                              </DropdownMenuItem>
                            )}
                            {interview.generatedScriptDefinition && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedInterview(interview);
                                  setOpenDialog("scriptDefinition");
                                }}
                              >
                                <FileCode className="h-4 w-4 mr-2" />
                                Read Script Definition
                              </DropdownMenuItem>
                            )}
                            {interview.generatedScriptText && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedInterview(interview);
                                  setOpenDialog("scriptText");
                                }}
                              >
                                <FileType className="h-4 w-4 mr-2" />
                                Read Script Text
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedInterview(interview);
                                setOpenDialog("pipelineContext");
                              }}
                            >
                              <Code className="h-4 w-4 mr-2" />
                              View Pipeline Context
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedInterview(interview);
                                setOpenDialog("interviewParams");
                              }}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              View Interview Parameters
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <div className="flex flex-col items-center gap-2 py-8">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No post interviews found
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          {data && data.data && data.data.length > 0 && (
            <div className="mt-4">
              <DataTablePagination
                currentPage={page}
                pageCount={data.totalPages}
                setCurrentPage={setPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                total={data.total}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {selectedInterview && (
        <>
          {openDialog === "post" && (
            <PostContentDialog
              interviewId={selectedInterview.interviewId}
              open={openDialog === "post"}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedInterview(null);
                  setOpenDialog(null);
                }
              }}
            />
          )}
          {openDialog === "scriptDefinition" && (
            <ScriptDefinitionDialog
              interviewId={selectedInterview.interviewId}
              scriptDefinition={selectedInterview.generatedScriptDefinition}
              open={openDialog === "scriptDefinition"}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedInterview(null);
                  setOpenDialog(null);
                }
              }}
            />
          )}
          {openDialog === "scriptText" && (
            <ScriptTextDialog
              interviewId={selectedInterview.interviewId}
              scriptText={selectedInterview.generatedScriptText}
              open={openDialog === "scriptText"}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedInterview(null);
                  setOpenDialog(null);
                }
              }}
            />
          )}
          {openDialog === "pipelineContext" && (
            <PipelineContextDialog
              interviewId={selectedInterview.interviewId}
              open={openDialog === "pipelineContext"}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedInterview(null);
                  setOpenDialog(null);
                }
              }}
            />
          )}
          {openDialog === "interviewParams" && (
            <InterviewParamsDialog
              interview={selectedInterview}
              open={openDialog === "interviewParams"}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedInterview(null);
                  setOpenDialog(null);
                }
              }}
            />
          )}
        </>
      )}
    </>
  );
}
