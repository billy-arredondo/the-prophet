import { cn } from '@/lib/utils';

interface MaterialIconProps {
  icon: string;
  filled?: boolean;
  className?: string;
  size?: number;
}

/**
 * Wrapper for Material Symbols Outlined icon font.
 * Use `filled` to enable the filled variant (FILL=1).
 */
export function MaterialIcon({ icon, filled = false, className, size }: MaterialIconProps) {
  return (
    <span
      className={cn('material-symbols-outlined', filled && 'filled', className)}
      style={size ? { fontSize: `${size}px` } : undefined}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
}
