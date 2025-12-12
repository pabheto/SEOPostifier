"use client";

import React from "react";
import { POSTS_LIST_QUERY } from "@/queries/blog-posts";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

type BlogPost = {
  id: string;
  title: string;
  content: string;
  category: {
    id: string;
    title: string;
  } | null;
  status: string;
  createdAt: string;
};

export default function BlogPostList() {
  const columns = React.useMemo<ColumnDef<BlogPost>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: "ID",
      },
      {
        id: "title",
        accessorKey: "title",
        header: "Title",
      },
      {
        id: "content",
        accessorKey: "content",
        header: "Content",
        cell: function render({ getValue }) {
          const value = getValue() as string;
          if (!value) return "-";
          return <span>{value.slice(0, 80)}...</span>;
        },
      },
      {
        id: "category",
        accessorKey: "category.title",
        header: "Category",
        cell: function render({ row }) {
          return row.original.category?.title || "-";
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Created at",
        cell: function render({ getValue }) {
          const value = getValue() as string;
          if (!value) return "-";
          return format(new Date(value), "MMM dd, yyyy");
        },
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "id",
        cell: function render({ getValue }) {
          return (
            <div className="flex items-center gap-2">
              <EditButton hideText size="sm" recordItemId={getValue() as string} />
              <ShowButton hideText size="sm" recordItemId={getValue() as string} />
              <DeleteButton hideText size="sm" recordItemId={getValue() as string} />
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useTable<BlogPost>({
    columns,
    refineCoreProps: {
      resource: "blog-posts",
      meta: {
        gqlQuery: POSTS_LIST_QUERY,
      },
    },
  });

  return (
    <ListView>
      <ListViewHeader />
      <DataTable table={table} />
    </ListView>
  );
}

