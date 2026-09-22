import { initials } from '@/lib/utils';

const PALETTE = ['#2563EB', '#E11D48', '#16A34A', '#F97316', '#7C3AED', '#0891B2', '#DB2777', '#65A30D'];
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export function UserAvatar({ name, size = 28, src }: { name: string; size?: number; src?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img src={src} alt={name} title={name} width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <span title={name} className="inline-grid shrink-0 place-items-center rounded-full font-semibold text-white" style={{ width: size, height: size, background: PALETTE[hash(name) % PALETTE.length], fontSize: size * 0.4 }}>
      {initials(name)}
    </span>
  );
}

export const UserChip = ({ name }: { name?: string }) =>
  name ? (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <UserAvatar name={name} size={24} />
      {name.split(' ')[0]}
    </span>
  ) : (
    <span className="text-muted-foreground">—</span>
  );
