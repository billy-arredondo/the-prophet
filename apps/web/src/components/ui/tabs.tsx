import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'flex items-center border-b border-(--color-outline-variant) overflow-x-auto no-scrollbar gap-6',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'py-3 px-1 text-sm font-bold text-(--color-on-surface-variant) whitespace-nowrap',
      'relative transition-colors',
      'focus-visible:outline-none',
      'data-[state=active]:text-(--color-stadium-green-light)',
      // underline indicator
      'data-[state=active]:after:absolute data-[state=active]:after:bottom-[-2px]',
      'data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-[3px]',
      'data-[state=active]:after:bg-(--color-stadium-green-light) data-[state=active]:after:rounded-full',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('mt-4 focus-visible:outline-none', className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
