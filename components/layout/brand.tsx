export function TeamLogo({ url, name, size = 36 }: { url?: string | null; name: string; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (url) return <img src={url} alt={`Logo ${name}`} width={size} height={size} className="shrink-0 rounded-xl object-cover" style={{ width: size, height: size }} />;
  return (
    <span className="grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-ftc font-display font-bold text-white" style={{ width: size, height: size, fontSize: size * 0.4 }} aria-hidden>
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}
