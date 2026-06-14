import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-12 w-full rounded-xl border border-(--color-outline-variant) bg-(--color-surface-container-lowest)',
        'px-4 py-2 text-base text-(--color-on-surface) placeholder:text-(--color-on-surface-variant)/60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-stadium-green-light)',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-shadow',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
