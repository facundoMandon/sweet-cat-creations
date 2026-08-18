import * as React from "react";
import { Button } from "@/components/ui/button";
import { cloudinaryUrl, subirImagenCloudinary, firmarUploadCloudinary } from "@/lib/cloudinary";
import { useToast } from "@/components/ui/toast";

interface ImageUploaderProps {
  /** URL de imagen actual (puede ser Cloudinary o local/externa). */
  imageUrl: string | null | undefined;
  publicId: string | null | undefined;
  /** Se dispara al finalizar: url + publicId de Cloudinary. */
  onChange: (url: string | null, publicId: string | null) => void;
}

export function ImageUploader({ imageUrl, publicId, onChange }: ImageUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const preview = cloudinaryUrl(publicId, imageUrl, "card", imageUrl ?? "/mascot-cat.png");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("Solo se permiten imágenes");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("La imagen debe pesar menos de 5 MB");
      return;
    }

    setUploading(true);
    try {
      const firma = await firmarUploadCloudinary();
      const result = await subirImagenCloudinary(file, firma);
      onChange(result.url, result.publicId);
      toast("Imagen subida correctamente");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error al subir la imagen");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl border border-border bg-muted">
        {preview ? (
          <img
            src={preview}
            alt="Vista previa"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
            Subiendo...
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Subiendo..." : publicId ? "Cambiar imagen" : "Subir imagen"}
        </Button>
        {(publicId || imageUrl) && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => onChange(null, null)}
            disabled={uploading}
          >
            Quitar
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
