"use client";

// React, Next.js
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Prisma model
import {
  Category,
  Country,
  OfferTag,
  ShippingFeeMethod,
  SubCategory,
} from "@prisma/client";

// Form handling utilities
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@hookform/error-message";
// Schema
import { ProductFormSchemaEdycja } from "@/lib/schemas";

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
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageUpload from "../shared/image-upload";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiSelect } from "react-multi-select-component";

// Queries
import { upsertProduct } from "@/queries/product";
import { getAllCategoriesForCategory } from "@/queries/category";

// ReactTags
import { WithOutContext as ReactTags } from "react-tag-input";

// Utils
import { v4 } from "uuid";

// Types
import { ProductWithVariantTypeEdycja } from "@/lib/types";
import ImagesPreviewGrid from "../shared/images-preview-grid";
import ClickToAddInputs from "./click-to-add";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
// React date time picker
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import { format } from "date-fns";

// Jodit text editor
import JoditEditor from "jodit-react";
import { NumberInput } from "@tremor/react";
import InputFieldset from "../shared/input-fieldset";
import { ArrowRight, Dot } from "lucide-react";
import { useTheme } from "next-themes";

const shippingFeeMethods = [
  {
    value: ShippingFeeMethod.ITEM,
    description: "ITEM (Fees calculated based on number of products.)",
  },
  {
    value: ShippingFeeMethod.WEIGHT,
    description: "WEIGHT (Fees calculated based on product weight)",
  },
  {
    value: ShippingFeeMethod.FIXED,
    description: "FIXED (Fees are fixed.)",
  },
];

interface ProductDetailsProps {
  data?: Partial<ProductWithVariantTypeEdycja>;
  categories: Category[];
  offerTags: OfferTag[];
  storeUrl: string;
  countries: Country[];
}

const ProductDetails: FC<ProductDetailsProps> = ({
  data,
  categories,
  offerTags,
  storeUrl,
  countries,
}) => {
  // Initializing necessary hooks
  const { toast } = useToast(); // Hook for displaying toast messages
  const router = useRouter(); // Hook for routing

  // Is new variant page
  const isNewVariantPage = data?.productId && !data?.variantId;

  // Jodit editor refs
  const productDescEditor = useRef(null);
  const variantDescEditor = useRef(null);

  // Jodit configuration
  const { theme } = useTheme();

  const config = useMemo(
    () => ({
      theme: theme === "dark" ? "dark" : "default",
    }),
    [theme]
  );

  // State for subCategories
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  // State for colors
  const [colors, setColors] = useState<{ color: string }[]>(
    data?.colors || [{ color: "" }]
  );

  // Temporary state for images
  const [images, setImages] = useState<{ url: string }[]>([]);

  // State for sizes
  const [sizes, setSizes] = useState<
    { size: string; price: number; quantity: number; discount: number }[]
  >(data?.sizes || [{ size: "", quantity: 1, price: 0.01, discount: 0 }]);

  // State for product specs
  const [productSpecs, setProductSpecs] = useState<
    { name: string; value: string }[]
  >(data?.product_specs || [{ name: "", value: "" }]);

  // State for product variant specs
  const [variantSpecs, setVariantSpecs] = useState<
    { name: string; value: string }[]
  >(data?.variant_specs || [{ name: "", value: "" }]);

  // State for product variant specs
  const [questions, setQuestions] = useState<
    { question: string; answer: string }[]
  >(data?.questions || [{ question: "", answer: "" }]);

  // Form hook for managing form state and validation

  const form = useForm<z.infer<typeof ProductFormSchemaEdycja>>({
    mode: "onChange", // Form validation mode
    resolver: zodResolver(ProductFormSchemaEdycja), // Rozwiązywacz do walidacji formularzy
    defaultValues: {
      // Ustawianie domyślnych wartości formularza z danych (jeśli są dostępne)
      variantName: data?.variantName,
      variantDescription: data?.variantDescription,
      sizes: data?.sizes,
      isSale: data?.isSale || false,
      saleEndDate:
        data?.saleEndDate || format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    },
  });
 
  const saleEndDate = form.getValues().saleEndDate || new Date().toISOString();

  const formattedDate = new Date(saleEndDate).toLocaleString("en-Us", {
    weekday: "short", // Abbreviated day name (e.g., "Mon")
    month: "long", // Abbreviated month name (e.g., "Nov")
    day: "2-digit", // Two-digit day (e.g., "25")
    year: "numeric", // Full year (e.g., "2024")
    hour: "2-digit", // Two-digit hour (e.g., "02")
    minute: "2-digit", // Two-digit minute (e.g., "30")
    second: "2-digit", // Two-digit second (optional)
    hour12: false, // 12-hour format (change to false for 24-hour format)
  });

  // UseEffect to get subCategories when user pick/change a category
  useEffect(() => {
    const getSubCategories = async () => {
      const res = await getAllCategoriesForCategory(form.watch().categoryId);
      setSubCategories(res);
    };
    getSubCategories();
  }, [form.watch().categoryId]);

  // Extract errors state from form
  const errors = form.formState.errors;
console.log("data", data)
  // Loading status based on form submission
  const isLoading = form.formState.isSubmitting;

  // Submit handler for form submission
  const handleSubmit = async (
    values: z.infer<typeof ProductFormSchemaEdycja>
  ) => {
    console.log("val", values);
    try {
      const response = upsertProduct(
        {
          productId: data?.productId ? data.productId : v4(),
          variantId: data?.variantId ? data.variantId : v4(),
          variantName: values.variantName,
          variantDescription: values.variantDescription || "",
          sizes: values.sizes,
          isSale: values.isSale,
          saleEndDate: values.saleEndDate,
          updatedAt: new Date(),
          // description: values.description,
          // variantName: values.variantName ? values.variantName : "",
          // variantDescription: values.variantDescription || "",
          // images: values.images,

          // categoryId: values.categoryId,
          // subCategoryId: values.subCategoryId,
          // offerTagId: values.offerTagId || "",
          // isSale: values.isSale,
          // saleEndDate: values.saleEndDate,
          // brand: values.brand,
          // sku: values.sku || "",

          // colors: values.colors,
          // sizes: values.sizes,
          // product_specs: values.product_specs ? values.product_specs : [],
          // variant_specs: values.variant_specs ? values.variant_specs : [],
          // keywords: values.keywords,
          // questions: values.questions ? values.questions : [],
          // shippingFeeMethod: "FIXED",
          // freeShippingForAllCountries: values.freeShippingForAllCountries,
          // freeShippingCountriesIds: values.freeShippingCountriesIds || [],

          // productId: data?.productId ? data.productId : v4(),
          // variantId: data?.variantId ? data.variantId : v4(),
          // name: values.name,
          // description: values.description,
          // variantName: isNewVariantPage ? values.variantName : values.name,
          // variantDescription: values.variantDescription || "",
          // images: values.images,
          // variantImage: isNewVariantPage
          //   ? values.variantImage[0].url
          //   : values.images[0].url,

          // categoryId: values.categoryId,
          // subCategoryId: values.subCategoryId,
          // offerTagId: values.offerTagId || "",
          // isSale: values.isSale,
          // saleEndDate: values.saleEndDate,
          // brand: values.brand || "",
          // sku: values.sku || "",
          // weight: values.weight || 1,
          // colors: values.colors || [],
          // sizes: values.sizes,
          // product_specs: values.product_specs || [],
          // variant_specs: values.variant_specs || [],
          // keywords: values.keywords,
          // questions: values.questions || [],
          // shippingFeeMethod: values.shippingFeeMethod,
          // freeShippingForAllCountries: values.freeShippingForAllCountries,
          // freeShippingCountriesIds: values.freeShippingCountriesIds || [],
          // createdAt: new Date(),
          // updatedAt: new Date(),
        },
        storeUrl
      );

      // Displaying success message
      toast({
        title:
          data?.productId && data?.variantId
            ? "Product has been updated."
            : `Congratulations! product is now created.`,
      });

      // Redirect or Refresh data
      if (data?.productId && data?.variantId) {
        router.refresh();
      } else {
        router.push(`/dashboard/seller/stores/${storeUrl}/products`);
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Oops!",
        description: error.toString(),
      });
    }
  };

  // Handle keywords input
  const [keywords, setKeywords] = useState<string[]>(data?.keywords || []);

  interface Keyword {
    id: string;
    text: string;
  }

  const handleAddition = (keyword: Keyword) => {
    if (keywords.length === 10) return;
    setKeywords([...keywords, keyword.text]);
  };

  const handleDeleteKeyword = (i: number) => {
    setKeywords(keywords.filter((_, index) => index !== i));
  };

  // Whenever colors, sizes, keywords changes we update the form values
  useEffect(() => {
    form.setValue("colors", colors);
    form.setValue("sizes", sizes);
    form.setValue("keywords", keywords);
    form.setValue("product_specs", productSpecs);
    form.setValue("variant_specs", variantSpecs);
    form.setValue("questions", questions);
  }, [colors, sizes, keywords, productSpecs, questions, variantSpecs, data]);

  //Countries options
  type CountryOption = {
    label: string;
    value: string;
  };

  const countryOptions: CountryOption[] = countries.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  const handleDeleteCountryFreeShipping = (index: number) => {
    const currentValues = form.getValues().freeShippingCountriesIds;
    const updatedValues = currentValues.filter((_, i) => i !== index);
    form.setValue("freeShippingCountriesIds", updatedValues);
  };

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {isNewVariantPage
              ? `Add a new variant to ${data.name}`
              : "Create a new product"}
          </CardTitle>
          <CardDescription>
            {data?.productId && data.variantId
              ? `Update ${data?.name} product information.`
              : " Lets create a product. You can edit product later from the product page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Name */}
              <InputFieldset label="Name">
                <div className="flex flex-col lg:flex-row gap-4">
                  <FormField
                    control={form.control}
                    name="variantName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Variant name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="variantDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={5}
                            className="resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </InputFieldset>
              {/* Is On Sale */}
              <InputFieldset
                label="Sale"
                description="Is your product on sale ?"
              >
                <div>
                  <label
                    htmlFor="yes"
                    className="ml-5 flex items-center gap-x-2 cursor-pointer"
                  >
                    <FormField
                      control={form.control}
                      name="isSale"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <>
                              <input
                                type="checkbox"
                                id="yes"
                                checked={field.value}
                                onChange={field.onChange}
                                hidden
                              />
                              <Checkbox
                                checked={field.value}
                                // @ts-ignore
                                onCheckedChange={field.onChange}
                              />
                            </>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <span>Yes</span>
                  </label>
                  {form.getValues().isSale && (
                    <div className="mt-5">
                      <p className="text-sm text-main-secondary dark:text-gray-400 pb-3 flex">
                        <Dot className="-me-1" />
                        When sale does end ?
                      </p>
                      <div className="flex items-center gap-x-5">
                        <FormField
                          control={form.control}
                          name="saleEndDate"
                          render={({ field }) => (
                            <FormItem className="ml-4">
                              <FormControl>
                                <DateTimePicker
                                  className="inline-flex items-center gap-2 p-2 border rounded-md shadow-sm"
                                  calendarIcon={
                                    <span className="text-gray-500 hover:text-gray-600">
                                      📅
                                    </span>
                                  }
                                  clearIcon={
                                    <span className="text-gray-500 hover:text-gray-600">
                                      ✖️
                                    </span>
                                  }
                                  onChange={(date) => {
                                    field.onChange(
                                      date
                                        ? format(date, "yyyy-MM-dd'T'HH:mm:ss")
                                        : ""
                                    );
                                  }}
                                  value={
                                    field.value ? new Date(field.value) : null
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <ArrowRight className="w-4 text-[#1087ff]" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  )}
                </div>
              </InputFieldset>
  {/* Sizes*/}
              <InputFieldset label="Sizes, Quantities, Prices, Disocunts">
                <div className="w-full flex flex-col gap-y-3">
                  <ClickToAddInputs
                    details={sizes}
                    setDetails={setSizes}
                    initialDetail={{
                      size: "",
                      quantity: 1,
                      price: 0.01,
                      discount: 0,
                    }}
                    containerClassName="flex-1"
                    inputClassName="w-full"
                  />
                  {errors.sizes && (
                    <span className="text-sm font-medium text-destructive">
                      {errors.sizes.message}
                    </span>
                  )}
                </div>
              </InputFieldset>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "loading..."
                  : data?.productId && data.variantId
                  ? "Save product information"
                  : "Create product"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default ProductDetails;
