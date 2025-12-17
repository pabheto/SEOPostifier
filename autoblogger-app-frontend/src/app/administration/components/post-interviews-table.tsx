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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePostInterviews } from "@/queries/administration";
import { Eye, FileText } from "lucide-react";
import { useState } from "react";
import { PostContentDialog } from "./post-content-dialog";

export function PostInterviewsTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, error } = usePostInterviews(page, pageSize);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(
    null
  );

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
                        {interview.hasGeneratedContent ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setSelectedInterviewId(interview.interviewId)
                            }
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Read Content
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No content
                          </span>
                        )}
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

      {selectedInterviewId && (
        <PostContentDialog
          interviewId={selectedInterviewId}
          open={!!selectedInterviewId}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedInterviewId(null);
            }
          }}
        />
      )}
    </>
  );
}
