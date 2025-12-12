"use client";

import React from "react";
import { CATEGORY_EDIT_MUTATION } from "@/queries/categories";
import { EditView, EditViewHeader } from "@/components/refine-ui/views/edit-view";
import { useForm } from "@refinedev/react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CategoryEdit() {
  const {
    refineCore: { formLoading, onFinish },
    saveButtonProps,
    register,
    control,
  } = useForm({
    refineCoreProps: {
      resource: "categories",
      meta: {
        gqlMutation: CATEGORY_EDIT_MUTATION,
      },
    },
  });

  return (
    <EditView>
      <EditViewHeader />
      <Form {...{ control, register }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            onFinish({
              title: formData.get("title"),
            });
          }}
          className="space-y-6"
        >
          <FormField
            control={control}
            name="title"
            rules={{ required: "Title is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={formLoading} {...saveButtonProps}>
              {formLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </EditView>
  );
}

