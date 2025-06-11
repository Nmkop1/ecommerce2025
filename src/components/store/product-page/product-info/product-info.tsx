"use client";
import {
  CartProductType,
  ProductDataType,
  ProductVariantDataType,
} from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, FC, SetStateAction } from "react";
import { CopyIcon } from "@/components/store/icons";
import toast from "react-hot-toast";
import ReactStars from "react-rating-stars-component";
import ProductPrice from "./product-price";
import Countdown from "../../shared/countdown";
import { Separator } from "@/components/ui/separator";
import ColorWheel from "@/components/shared/color-wheel";
import ProductVariantSelector from "./variant-selector";
import SizeSelector from "./size-selector";
import ProductAssurancePolicy from "./assurance-policy";
import ProductWatch from "./product-watch";

interface Props {
  productData: ProductDataType;
  variant: ProductVariantDataType;
  setVariant: Dispatch<SetStateAction<ProductVariantDataType>>;
  quantity: number;
  sizeId: string | undefined;
  setSizeId: Dispatch<SetStateAction<string>>;
  handleChange: (property: keyof CartProductType, value: any) => void;
  setActiveImage: Dispatch<SetStateAction<{ url: string } | null>>;
  variantSlug: string;
}

const ProductInfo: FC<Props> = ({
  productData,
  quantity,
  sizeId,
  setSizeId,
  handleChange,
  setActiveImage,
  variant,
  variantSlug,
  setVariant,
}) => {
  // Check if productData exists, return null if it's missing (prevents rendering when there's no data)
  if (!productData) return null;

  // Destructure necessary properties from the productData object
  const { name, store, rating, numReviews, variants } = productData;
  const { isSale, saleEndDate, colors } = variant;
  console.log("Product Info Rendered", productData);
  // Function to copy the SKU to the clipboard
  const copySkuToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(variant.sku);
      toast.success("Copied successfully");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };
  console.log(variant);
  return (
    <div className="relative w-full xl:w-[540px]">
      {/* Title */}
      <div>
        <h1 className="text-main-primary inline font-bold leading-5">
          {name}{" "}
          {variant.variantName === "" ? null : `- ${variant.variantName}`}
        </h1>
      </div>
      {/* Sku - Rating - Num reviews */}
      <div className="flex items-center text-xs mt-2">
        {/* Sku - Rating - Num reviews */}
        {variant.sku === "" ? null : (
          <div className="whitespace-nowrap">
            <span className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-gray-500">
              SKU: {variant.sku}
            </span>
            <span
              className="inline-block align-middle text-[#2F68A8] mx-1 cursor-pointer"
              onClick={copySkuToClipboard}
            >
              <CopyIcon />
            </span>
          </div>
        )}
        <div className="md:ml-4 flex items-center gap-x-2 flex-1 whitespace-nowrap">
          <ReactStars
            count={5}
            size={24}
            color="#F5F5F5"
            activeColor="#FFD804"
            value={rating}
            isHalf
            edit={false}
          />
          <Link href="#reviews" className="text-[#ffd804] hover:underline">
            (
            {numReviews === 0
              ? "No review yet"
              : numReviews === 1
              ? "1 review"
              : `${numReviews} reviews`}
            )
          </Link>
        </div>
      </div>
      {/* Price - Sale countdown */}
      <div className="my-2 relative flex flex-col sm:flex-row justify-between">
        <ProductPrice
          sizeId={sizeId}
          sizes={variant.sizes}
          handleChange={handleChange}
          weight={variant.weight}
        />
        {isSale && saleEndDate && (
          <div className="mt-4 pb-2">
            <Countdown targetDate={saleEndDate} />
          </div>
        )}
      </div>
      {/* Product live watchers count */}
      <div>
        <ProductWatch productId={productData.id} />
      </div>
      <Separator className="mt-2" />
      {/* Color wheel - variant switcher */}

      
      <div className="mt-4 space-y-2">
        <div className="relative flex items-center justify-between text-main-primary font-bold">
          <span className="flex items-center gap-x-2">
            {colors.length > 1 ? "Kolory" : "Kolor"}
            <ColorWheel colors={colors} size={25} />
          </span>
        </div>
        <div className="mt-4">
          {variants.length > 0 && (
            <ProductVariantSelector
              variants={variants}
              slug={variant.slug}
              setActiveImage={setActiveImage}
              handleChange={handleChange}
              setSizeId={setSizeId}
              setVariant={setVariant}
            />
          )}
        </div>
      </div>
      {/* Size selector */}
      <div className="space-y-2 pb-2 mt-4">
        <div>
          <h1 className="text-main-primary font-bold">Size </h1>
        </div>
        <SizeSelector
          sizes={variant.sizes}
          sizeId={sizeId}
          setSizeId={setSizeId}
          handleChange={handleChange}
        />
      </div>
      {/* Product assurance */}
      <Separator className="mt-2" />
   
       
    </div>
  );
};

export default ProductInfo;
