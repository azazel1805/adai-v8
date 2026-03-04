
import { PEXELS_API_KEY } from '../constants';

export const getImageForWord = async (word: string): Promise<string | null> => {
  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(word)}&per_page=1`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (!response.ok) {
      console.error("Pexels API error:", response.statusText);
      return null;
    }

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.large;
    }
    return null;
  } catch (error) {
    console.error("Error fetching image from Pexels:", error);
    return null;
  }
};
