"use server";

import { db } from "@/lib/db";
import { ReviewDetailsType } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { getRatingStatistics } from "./product";

// Funkcja: upsertReview
// Opis: Wstawia recenzję do bazy danych, aktualizując ją, jeśli istnieje, lub tworząc nową, jeśli nie istnieje.
// Poziom uprawnień: Tylko administrator do tworzenia/aktualizowania recenzji.
// Parametry:
// - productId: Identyfikator produktu, z którym skojarzona jest recenzja.
// - review: Obiekt recenzji zawierający szczegóły recenzji, która ma zostać wstawiona.
// Zwraca: Zaktualizowane lub nowo utworzone szczegóły recenzji.
export const upsertReview = async (
  productId: string,
  review: ReviewDetailsType
) => {
  try {
    // Get current user
    const user = await currentUser();

    // Ensure user is authenticated
    if (!user) throw new Error("Unauthenticated.");

    // Ensure productId and review data are provided
    if (!productId) throw new Error("Product ID is required.");
    if (!review) throw new Error("Please provide review data.");

    // check for existing review
    const existingReview = await db.review.findFirst({
      where: {
        productId,
        userId: user.id,
        variant: review.variant,
      },
    });

    let review_data: ReviewDetailsType = review;
    if (existingReview) {
      review_data = { ...review_data, id: existingReview.id };
    }
    // Upsert review into the database
    const reviewDetails = await db.review.upsert({
      where: {
        id: review_data.id,
      },
      update: {
        ...review_data,
        images: {
          deleteMany: {},
          create: review_data.images.map((img) => ({
            url: img.url,
          })),
        },
        userId: user.id,
      },
      create: {
        ...review_data,
        images: {
          create: review_data.images.map((img) => ({
            url: img.url,
          })),
        },
        productId,
        userId: user.id,
      },
      include: {
        images: true,
        user: true,
      },
    });

    // Calculate the new average rating
    const productReviews = await db.review.findMany({
      where: {
        productId,
      },
      select: {
        rating: true,
      },
    });

    const totalRating = productReviews.reduce(
      (acc, rev) => acc + rev.rating,
      0
    );

    const averageRating = totalRating / productReviews.length;

    // Update the product rating
    const updatedProduct = await db.product.update({
      where: {
        id: productId,
      },
      data: {
        rating: averageRating, // Update the product rating with the new average
        numReviews: productReviews.length, // Update the number of reviews
      },
    });
    const statistics = await getRatingStatistics(productId);
    const message = existingReview
      ? "Your review has been updated successfully!"
      : "Thank you for submitting your review!";

    return {
      review: reviewDetails,
      rating: averageRating,
      statistics,
      message,
    };
  } catch (error) {
    // Log and re-throw any errors
    throw error;
  }
};
