'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

// Local reservation info type
interface ReservationInfo {
  hasReservation?: boolean;
  remainingSeconds?: number;
  countdownMessage?: string;
  expiresAt?: string;
}

interface ReservationCountdownProps {
  reservation: ReservationInfo | undefined | null;
  onExpired?: () => void;
  className?: string;
}

export function ReservationCountdown({
  reservation,
  onExpired,
  className = '',
}: ReservationCountdownProps) {
  const [remaining, setRemaining] = useState<number>(
    reservation?.remainingSeconds || 0
  );

  useEffect(() => {
    if (reservation?.remainingSeconds) {
      setRemaining(reservation.remainingSeconds);
    }
  }, [reservation?.remainingSeconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onExpired?.();
      return;
    }

    const timer = setInterval(() => {
      setRemaining((r) => {
        const newValue = Math.max(0, r - 1);
        if (newValue === 0) {
          onExpired?.();
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining, onExpired]);

  if (!reservation?.hasReservation || remaining <= 0) {
    return null;
  }

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isUrgent = remaining < 120; // Less than 2 minutes

  // Use custom message from store or default
  const message = reservation.countdownMessage
    ? reservation.countdownMessage.replace('{time}', timeDisplay)
    : `הפריטים שמורים עבורך עוד ${timeDisplay}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center gap-2 p-3 rounded-lg ${
          isUrgent
            ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
        } ${className}`}
      >
        {isUrgent ? (
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        ) : (
          <Clock className="h-4 w-4 flex-shrink-0" />
        )}
        <span className="text-sm font-medium">{message}</span>
        <motion.span
          key={timeDisplay}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={`font-mono font-bold ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}
        >
          {timeDisplay}
        </motion.span>
      </motion.div>
    </AnimatePresence>
  );
}
