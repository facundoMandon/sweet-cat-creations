import { v2 as cloudinary } from "cloudinary";

/**
 * Configura Cloudinary usando variables de entorno.
 * Si el secret no está definido, la firma falla de forma controlada.
 */
export function configureCloudinary() {
  const cloudName = process.env["CLOUDINARY_CLOUD_NAME"];
  const apiKey = process.env["CLOUDINARY_API_KEY"];
  const apiSecret = process.env["CLOUDINARY_SECRET"] ?? process.env["CLOUDINARY_API_SECRET"];

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("Cloudinary: faltan credenciales. El upload queda deshabilitado.");
    return false;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  return true;
}

export { cloudinary };
