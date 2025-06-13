// Product details form
// import ProductDetailsVariants from "@/components/dashboard/forms/product-details-variants";
import { db } from "@/lib/db";

// Queries
import { getAllCategories } from "@/queries/category";
import { getAllOfferTags } from "@/queries/offer-tag";
import { getProductVariant } from "@/queries/product";

export default async function ProductVariantPage({
  params,
}: {
  params: { storeUrl: string; productId: string; variantId: string };
}) {
  const categories = await getAllCategories();
  const offerTags = await getAllOfferTags();
  const { productId, variantId, storeUrl } = params;
  const productDetails = await getProductVariant(productId, variantId);

  if (!productDetails) return;
  // const newDetails = {
  //   ...ProductDetails,
  //   variantDescription: productDetails.variantDescription ?? undefined,
  // };
 
  const countries = await db.country.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div>
      {/* <ProductDetailsVariants
        categories={categories}
        offerTags={offerTags}
        storeUrl={storeUrl}
        data={productDetails}
        countries={countries}
      /> */}
    </div>
  );
}
