'use client';

import { type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface AccessibilityToggleProps {
  icon: LucideIcon;
  label: string;
  description: string;
  isActive: boolean;
  onChange: () => void;
}

export function AccessibilityToggle({
  icon: Icon,
  label,
  description,
  isActive,
  onChange,
}: AccessibilityToggleProps) {
  return (
    <button
      onClick={onChange}
      className="w-full flex items-start gap-4 p-4 rounded-lg border border-border
                 transition-all hover:bg-muted/50 focus:outline-none focus:ring-2
                 focus:ring-gold-500 focus:ring-offset-2 text-right group"
      aria-pressed={isActive}
      aria-label={`${label}: ${isActive ? 'פעיל' : 'לא פעיל'}`}
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 p-2 rounded-full transition-colors ${
          isActive
            ? 'bg-gold-500 text-primary'
            : 'bg-muted text-muted-foreground group-hover:bg-gold-100'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Text */}
      <div className="flex-1 text-right">
        <div className="font-medium text-foreground">{label}</div>
        <div className="text-sm text-muted-foreground mt-0.5">
          {description}
        </div>
      </div>

      {/* Toggle indicator */}
      <motion.div
        className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors ${
          isActive ? 'bg-gold-500' : 'bg-muted'
        }`}
        role="presentation"
      >
        <motion.div
          className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow-md"
          animate={{
            x: isActive ? -25 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      </motion.div>
    </button>
  );
}
