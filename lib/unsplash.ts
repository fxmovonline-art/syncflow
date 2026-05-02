export interface UnsplashImage {
  id: string;
  urls: {
    thumb: string;
    full: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
  };
}

export async function getRandomBoardImages(count: number = 9): Promise<UnsplashImage[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    throw new Error("UNSPLASH_ACCESS_KEY is not configured");
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?count=${count}&query=workspace,design,minimalist,abstract,backdrop&orientation=landscape&client_id=${accessKey}`
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const images = await response.json();
    return images;
  } catch (error) {
    console.error("[UNSPLASH_ERROR]", error);
    throw error;
  }
}
