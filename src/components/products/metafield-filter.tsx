'use client';

import { DropdownMenu } from 'radix-ui';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetafieldFilterProps {
  label: string;
  values: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

/**
 * Multi-select facet dropdown for a single filterable metafield definition.
 * Selecting multiple values within a facet is OR; across facets the caller
 * applies AND. Matches the catalog's dark glass styling.
 */
export function MetafieldFilter({ label, values, selected, onChange }: MetafieldFilterProps) {
  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  const count = selected.length;

  return (
    <DropdownMenu.Root dir="rtl">
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-2 h-10 px-4 rounded-full border text-sm whitespace-nowrap outline-none transition-colors',
            count > 0
              ? 'bg-gold-500/15 border-gold-500/40 text-white'
              : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
          )}
        >
          {label}
          {count > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-gold-500 text-[11px] font-semibold text-black">
              {count}
            </span>
          )}
          <ChevronDown className="w-4 h-4 opacity-60" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-44 max-h-72 overflow-y-auto rounded-2xl border border-white/15 bg-neutral-900/95 p-1.5 shadow-xl backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {values.map((value) => {
            const isSelected = selected.includes(value);
            return (
              <DropdownMenu.CheckboxItem
                key={value}
                checked={isSelected}
                onCheckedChange={() => toggle(value)}
                onSelect={(e) => e.preventDefault()}
                className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/90 outline-none select-none data-[highlighted]:bg-white/10"
              >
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded border transition-colors',
                    isSelected ? 'bg-gold-500 border-gold-500 text-black' : 'border-white/30'
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </span>
                {value}
              </DropdownMenu.CheckboxItem>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
