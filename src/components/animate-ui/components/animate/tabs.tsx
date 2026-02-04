'use client';

import * as React from 'react';

import {
  Tabs as TabsPrimitive,
  TabsList as TabsListPrimitive,
  TabsTrigger as TabsTriggerPrimitive,
  TabsContent as TabsContentPrimitive,
  TabsContents as TabsContentsPrimitive,
  TabsHighlightItem as TabsHighlightItemPrimitive,
  type TabsProps as TabsPrimitiveProps,
  type TabsListProps as TabsListPrimitiveProps,
  type TabsTriggerProps as TabsTriggerPrimitiveProps,
  type TabsContentProps as TabsContentPrimitiveProps,
  type TabsContentsProps as TabsContentsPrimitiveProps,
} from '@/components/animate-ui/primitives/animate/tabs';
import { cn } from '@/lib/utils';

type TabsProps = TabsPrimitiveProps;

function Tabs({ className, ...props }: TabsProps) {
  return (
    <TabsPrimitive
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

type TabsListProps = TabsListPrimitiveProps;

function TabsList({ className, ...props }: TabsListProps) {
  return (
    <TabsListPrimitive
      className={cn(
        'inline-flex h-auto w-fit items-center justify-center rounded-full p-1 gap-1',
        className,
      )}
      {...props}
    />
  );
}

type TabsTriggerProps = TabsTriggerPrimitiveProps & {
  highlightClassName?: string;
};

function TabsTrigger({ className, highlightClassName, ...props }: TabsTriggerProps) {
  return (
    <TabsHighlightItemPrimitive
      value={props.value}
      highlightClassName={highlightClassName || "bg-white shadow-md"}
    >
      <TabsTriggerPrimitive
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-300 disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </TabsHighlightItemPrimitive>
  );
}

type TabsContentsProps = TabsContentsPrimitiveProps;

function TabsContents(props: TabsContentsProps) {
  return <TabsContentsPrimitive {...props} />;
}

type TabsContentProps = TabsContentPrimitiveProps;

function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsContentPrimitive
      className={cn('outline-none', className)}
      {...props}
    />
  );
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsContent,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentsProps,
  type TabsContentProps,
};
