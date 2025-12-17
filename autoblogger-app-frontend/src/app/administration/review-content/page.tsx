"use client";

import { FileText } from "lucide-react";
import { PostInterviewsTable } from "../components/post-interviews-table";

export default function ReviewContentPage() {
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-background to-muted/20">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">Review Content</h2>
        </div>
        <p className="text-muted-foreground text-base">
          Review all post interviews and their generated content
        </p>
      </div>

      <PostInterviewsTable />
    </div>
  );
}

