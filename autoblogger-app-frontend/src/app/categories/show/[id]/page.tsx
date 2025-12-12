"use client";

import React from "react";
import { CATEGORY_SHOW_QUERY } from "@/queries/categories";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { useShow } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default function CategoryShow() {
  const { queryResult } = useShow({
    meta: {
      gqlQuery: CATEGORY_SHOW_QUERY,
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

