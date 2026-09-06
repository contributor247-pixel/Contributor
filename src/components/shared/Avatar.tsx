interface AvatarProps {
  name: string | null;
  avatarUrl?: string | null;
  size?: number;
}

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Avatar({ name, avatarUrl, size = 32 }: AvatarProps) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- covers/avatars are stored as base64 data URLs, which next/image cannot optimize
    return (
      <img
        src={avatarUrl}
        alt={name ?? "User"}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-bg-muted text-text-muted"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
