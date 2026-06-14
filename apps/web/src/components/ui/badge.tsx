import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-(--color-stadium-green-light) text-white',
        live:
          'bg-(--color-score-red) text-white animate-pulse',
        secondary:
          'bg-(--color-secondary-container) text-(--color-on-secondary-container)',
        outline:
          'border border-(--color-outline-variant) text-(--color-on-surface-variant) bg-transparent',
        muted:
          'bg-(--color-surface-container-low) text-(--color-on-surface-variant)',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
