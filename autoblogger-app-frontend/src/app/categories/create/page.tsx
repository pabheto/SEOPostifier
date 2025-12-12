"use client";

import React from "react";
import { CATEGORY_CREATE_MUTATION } from "@/queries/categories";
import { CreateView, CreateViewHeader } from "@/components/refine-ui/views/create-view";
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

export default function CategoryCreate() {
  const {
    refineCore: { formLoading, onFinish },
    saveButtonProps,
    register,
    control,
  } = useForm({
    refineCoreProps: {
      resource: "categories",
      meta: {
        gqlMutation: CATEGORY_CREATE_MUTATION,
      },
    },
  });

  return (
    <CreateView>
      <CreateViewHeader />
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
    </CreateView>
  );
}

