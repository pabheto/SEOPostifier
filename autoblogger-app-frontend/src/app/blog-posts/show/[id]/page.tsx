"use client";

import React from "react";
import { POST_SHOW_QUERY } from "@/queries/blog-posts";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { useShow } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default function BlogPostShow() {
  const { queryResult } = useShow({
    meta: {
      gqlQuery: POST_SHOW_QUERY,
    },
  });

  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <ShowView>
      <ShowViewHeader />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ID</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{record?.id}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Title</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{record?.title}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap">{record?.content}</pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{record?.category?.title || "-"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{record?.status}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Created At</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                {record?.createdAt
                  ? format(new Date(record.createdAt), "MMM dd, yyyy HH:mm")
                  : "-"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </ShowView>
  );
}

