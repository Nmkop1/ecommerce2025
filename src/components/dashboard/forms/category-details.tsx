"use client";

// React
import { FC, useEffect } from "react";

// Prisma model
import { Category } from "@prisma/client";

// Form handling utilities
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema
import { CategoryFormSchema } from "@/lib/schemas";

// UI Components
import { AlertDialog } from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageUpload from "../shared/image-upload";

// Queries
import { upsertCategory } from "@/queries/category";

// Utils
import { v4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface CategoryDetailsProps {
  data?: Category;
}

const CategoryDetails: FC<CategoryDetailsProps> = ({ data }) => {
  // Initializing necessary hooks
  const { toast } = useToast(); // Hook for displaying toast messages
  const router = useRouter(); // Hook for routing

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof CategoryFormSchema>>({
    mode: "onChange", // Form validation mode
    resolver: zodResolver(CategoryFormSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      name: data?.name,  
      url: data?.url,
      featured: data?.featured,
    },
  });

  // Loading status based on form submission
  const isLoading = form.formState.isSubmitting;

  // Reset form values when data changes
  useEffect(() => {
    if (data) {
      form.reset({
        name: data?.name,
     
        url: data?.url,
        featured: data?.featured,
      });
    }
  }, [data, form]);

  // Submit handler for form submission
  const handleSubmit = async (values: z.infer<typeof CategoryFormSchema>) => {
    try {
      // Upserting category data
      const response = await upsertCategory({
        id: data?.id ? data.id : v4(),
        name: values.name,
 
        url: values.url,
        featured: values.featured,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Displaying success message
      toast({
        title: data?.id
          ? "Kategoria została zaktualizowana."
          : `Brawo!  Utworzono kategorię ${response?.name}   `,
      });

      // Redirect or Refresh data
      if (data?.id) {
        router.refresh();
      } else {
        router.push("/dashboard/seller/stores/dazino/categories");
      }
    } catch (error: any) {
      // Handling form submission errors
      toast({
        variant: "destructive",
        title: "Oops!",
        description: error.toString(),
      });
    }
  };

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Kategorie</CardTitle>
          <CardDescription>
            {data?.id ? `Zmieniono ${data?.name}.` : " Tworzenie kategorii."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                // disabled={isLoading}
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Nazwa kategorii</FormLabel>
                    <FormControl>
                      <Input placeholder="Nazwa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                // disabled={isLoading}
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Url kategorii</FormLabel>
                    <FormControl>
                      <Input placeholder="/category-url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        // @ts-ignore
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Wyróżniony</FormLabel>
                      <FormDescription>
                        Ta kategoria pojawi się na stronie głównej
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "loading..."
                  : data?.id
                  ? "Zapisz zmiany"
                  : "Utwórz kategorię"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default CategoryDetails;
