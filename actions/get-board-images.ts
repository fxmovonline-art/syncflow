"use server";

import { getRandomBoardImages } from "@/lib/unsplash";

export async function getBoardImages(count: number = 9) {
  try {
    return { data: await getRandomBoardImages(count) };
  } catch (error) {
    console.error("Failed to load board images:", error);
    return { error: "Failed to load images" };
  }
}
