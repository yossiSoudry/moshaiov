'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Local type definition for pickup locations
interface PickupLocation {
  id: string;
  name: string;
  price: string;
  address: {
    line1: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
  hours?: string;
  instructions?: string;
}

interface PickupStepProps {
  locations: PickupLocation[];
  onSelect: (
    locationId: string,
    customerInfo: { email: string; firstName?: string; lastName?: string; phone?: string }
  ) => void;
  loading?: boolean;
  initialEmail?: string;
  className?: string;
}

export function PickupStep({
  locations,
  onSelect,
  loading = false,
  initialEmail = '',
  className,
}: PickupStepProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [email, setEmail] = useState(initialEmail);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedId) {
      setError('אנא בחר נקודת איסוף');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('אנא הזן אימייל תקין');
      return;
    }

    setError(null);
    onSelect(selectedId, {
      email: email.trim(),
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      phone: phone.trim() || undefined,
    });
  };

  const inputClass =
    'bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/20 focus:border-primary h-10 w-full rounded border px-3 text-sm focus:outline-none focus:ring-2';

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)} dir="rtl">
      {/* Pickup locations */}
      <div className="space-y-3">
        <p className="text-foreground text-sm font-medium">בחר נקודת איסוף</p>
        {locations.map((loc) => {
          const price = parseFloat(loc.price);
          const isFree = price === 0;
          const isSelected = selectedId === loc.id;

          return (
            <button
              key={loc.id}
              type="button"
              onClick={() => {
                setSelectedId(loc.id);
                setError(null);
              }}
              className={cn(
                'flex w-full items-start gap-4 rounded border px-4 py-3 text-start transition-colors',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground'
              )}
            >
              {/* Radio indicator */}
              <div
                className={cn(
                  'mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2',
                  isSelected ? 'border-primary' : 'border-muted-foreground/40'
                )}
              >
                {isSelected && <div className="bg-primary h-2 w-2 rounded-full" />}
              </div>

              {/* Location info */}
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-sm font-medium">{loc.name}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {loc.address.line1}
                  {loc.address.city && `, ${loc.address.city}`}
                </p>
                {loc.hours && <p className="text-muted-foreground mt-0.5 text-xs">{loc.hours}</p>}
                {loc.instructions && (
                  <p className="text-muted-foreground mt-1 text-xs italic">{loc.instructions}</p>
                )}
              </div>

              {/* Price */}
              <span
                className={cn(
                  'flex-shrink-0 text-sm font-medium',
                  isFree ? 'text-primary' : 'text-foreground'
                )}
              >
                {isFree ? 'חינם' : formatPrice(price)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Customer info */}
      <div className="space-y-4">
        <p className="text-foreground text-sm font-medium">הפרטים שלך</p>

        <div>
          <label htmlFor="pickup-email" className="text-foreground mb-1 block text-sm">
            אימייל <span className="text-destructive">*</span>
          </label>
          <input
            id="pickup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(inputClass, 'border-border')}
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pickup-firstName" className="text-foreground mb-1 block text-sm">
              שם פרטי
            </label>
            <input
              id="pickup-firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={cn(inputClass, 'border-border')}
            />
          </div>
          <div>
            <label htmlFor="pickup-lastName" className="text-foreground mb-1 block text-sm">
              שם משפחה
            </label>
            <input
              id="pickup-lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={cn(inputClass, 'border-border')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="pickup-phone" className="text-foreground mb-1 block text-sm">
            טלפון
          </label>
          <input
            id="pickup-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={cn(inputClass, 'border-border')}
            placeholder="050-1234567 (אופציונלי)"
          />
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || !selectedId}
        className="bg-primary text-primary-foreground w-full rounded px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'שומר...' : 'המשך לתשלום'}
      </button>
    </form>
  );
}
