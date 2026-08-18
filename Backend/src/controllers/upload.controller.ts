import { asyncHandler } from "../utils/asyncHandler.js";
import { configureCloudinary, cloudinary } from "../config/cloudinary.js";
import { AppError } from "../utils/AppError.js";

/**
 * Genera una firma de Cloudinary para subida directa desde el navegador.
 * El API Secret nunca sale del servidor.
 */
export const firmarSubida = asyncHandler(async (_req, res) => {
  if (!configureCloudinary()) {
    throw new AppError("Cloudinary no está configurado", 503);
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = `blackcats/productos`;

  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env["CLOUDINARY_SECRET"] ?? process.env["CLOUDINARY_API_SECRET"]!,
  );

  res.json({
    success: true,
    data: {
      cloudName: process.env["CLOUDINARY_CLOUD_NAME"]!,
      apiKey: process.env["CLOUDINARY_API_KEY"]!,
      timestamp,
      folder,
      signature,
    },
  });
});
