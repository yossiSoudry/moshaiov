'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { cn } from '@/lib/utils';

// Types
export type TabsProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>;
export type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>;
export type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>;
export type TabsContentProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>;
export type TabsContentsProps = React.HTMLAttributes<HTMLDivElement>;

// Context for highlight
const TabsContext = React.createContext<{
  value: string | undefined;
  layoutId: string;
}>({
  value: undefined,
  layoutId: '',
});

// Tabs Root
const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ className, value, defaultValue, onValueChange, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = value ?? internalValue;
  const layoutId = React.useId();

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, layoutId }}>
      <LayoutGroup>
        <TabsPrimitive.Root
          ref={ref}
          value={currentValue}
          defaultValue={defaultValue}
          onValueChange={handleValueChange}
          className={className}
          {...props}
        />
      </LayoutGroup>
    </TabsContext.Provider>
  );
});
Tabs.displayName = 'Tabs';

// TabsList
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={className} {...props} />
));
TabsList.displayName = 'TabsList';

// TabsTrigger
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger ref={ref} className={className} {...props} />
));
TabsTrigger.displayName = 'TabsTrigger';

// TabsContent
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={className} {...props} asChild>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  </TabsPrimitive.Content>
));
TabsContent.displayName = 'TabsContent';

// TabsContents - wrapper for animated content
const TabsContents = React.forwardRef<HTMLDivElement, TabsContentsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        <AnimatePresence mode="wait">{children}</AnimatePresence>
      </div>
    );
  }
);
TabsContents.displayName = 'TabsContents';

// TabsHighlight - the animated background
const TabsHighlight = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('relative', className)} {...props}>
      {children}
    </div>
  );
});
TabsHighlight.displayName = 'TabsHighlight';

// TabsHighlightItem - wraps each trigger with highlight
const TabsHighlightItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; highlightClassName?: string }
>(({ className, children, value, highlightClassName, ...props }, ref) => {
  const { value: activeValue, layoutId } = React.useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <div ref={ref} className={cn('relative', className)} {...props}>
      {isActive && (
        <motion.div
          layoutId={`tab-highlight-${layoutId}`}
          className={cn("absolute inset-0 z-0 rounded-full", highlightClassName)}
          transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
});
TabsHighlightItem.displayName = 'TabsHighlightItem';

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
};
