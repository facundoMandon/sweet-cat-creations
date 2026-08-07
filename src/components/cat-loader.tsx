import { motion } from "framer-motion";

/** Loader con la mascota de la marca. */
export function CatLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.img
        src="/mascot-cat.png"
        alt="Gatito de Black Cats"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        className="size-20 object-contain drop-shadow-md"
      />
      {label ? (
        <p className="font-display text-sm font-semibold text-muted-foreground">
          {label}
        </p>
      ) : null}
    </div>
  );
}

/** Estado vacío ilustrado con la mascota. */
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <img
        src="/mascot-cat.png"
        alt=""
        className="size-24 object-contain opacity-90 animate-float-slow"
      />
      <div>
        <h3 className="font-display text-lg font-bold">{title}</h3>
        {description ? (
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
