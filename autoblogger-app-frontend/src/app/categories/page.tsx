"use client";

import React from "react";
import { CATEGORIES_LIST_QUERY } from "@/queries/categories";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

type Category = {
  id: string;
  title: string;
  createdAt: string;
};

export default function CategoryList() {
  const columns = React.useMemo<ColumnDef<Category>[]>(
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
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Created At",
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

  const table = useTable<Category>({
    columns,
    refineCoreProps: {
      resource: "categories",
      meta: {
        gqlQuery: CATEGORIES_LIST_QUERY,
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

