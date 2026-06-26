const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Generates a Cloudinary URL with transformations.
 */
export function getCloudinaryUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "scale" | "thumb";
    quality?: "auto" | number;
    format?: "auto" | "webp" | "jpg" | "png";
  }
): string {
  if (!CLOUD_NAME) {
    console.warn("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set");
    return publicId;
  }

  const transforms: string[] = [];

  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  if (options?.crop) transforms.push(`c_${options.crop}`);
  if (options?.quality) transforms.push(`q_${options.quality}`);
  if (options?.format) transforms.push(`f_${options.format}`);

  const transformString = transforms.length
    ? `${transforms.join(",")}/`
    : "";

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}${publicId}`;
}

/**
 * Max file size for uploads (5MB).
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Accepted image MIME types.
 */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/**
 * Accepted document MIME types (for KYC).
 */
export const ACCEPTED_DOCUMENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];
