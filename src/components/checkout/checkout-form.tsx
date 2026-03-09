'use client';

import { useState, useMemo } from 'react';
import type { SetShippingAddressDto, ShippingDestinations } from 'brainerce';
import { cn } from '@/lib/utils';

// Fallback country options (used when destinations not available from server)
const FALLBACK_COUNTRIES = [
  { code: 'IL', name: 'ישראל' },
  { code: 'US', name: 'ארצות הברית' },
  { code: 'GB', name: 'בריטניה' },
  { code: 'DE', name: 'גרמניה' },
  { code: 'FR', name: 'צרפת' },
];

// Fallback Israeli regions/districts
const FALLBACK_ISRAEL_REGIONS = [
  { code: 'CENTER', name: 'מרכז' },
  { code: 'TEL_AVIV', name: 'תל אביב' },
  { code: 'JERUSALEM', name: 'ירושלים' },
  { code: 'NORTH', name: 'צפון' },
  { code: 'HAIFA', name: 'חיפה' },
  { code: 'SOUTH', name: 'דרום' },
  { code: 'JUDEA_SAMARIA', name: 'יהודה ושומרון' },
];

interface CheckoutFormProps {
  onSubmit: (address: SetShippingAddressDto) => void;
  loading?: boolean;
  initialValues?: Partial<SetShippingAddressDto>;
  destinations?: ShippingDestinations | null;
  className?: string;
}

export function CheckoutForm({
  onSubmit,
  loading = false,
  initialValues,
  destinations,
  className,
}: CheckoutFormProps) {
  // Use server destinations if available, otherwise fallback
  const hasServerDestinations = destinations && destinations.countries.length > 0;

  const [formData, setFormData] = useState<SetShippingAddressDto>({
    email: initialValues?.email || '',
    firstName: initialValues?.firstName || '',
    lastName: initialValues?.lastName || '',
    line1: initialValues?.line1 || '',
    line2: initialValues?.line2 || '',
    city: initialValues?.city || '',
    region: initialValues?.region || '',
    postalCode: initialValues?.postalCode || '',
    country: initialValues?.country || (hasServerDestinations ? '' : 'IL'),
    phone: initialValues?.phone || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'נדרש אימייל';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'אנא הזן אימייל תקין';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'נדרש שם פרטי';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'נדרש שם משפחה';
    }
    if (!formData.line1.trim()) {
      newErrors.line1 = 'נדרשת כתובת';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'נדרשת עיר';
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'נדרש מיקוד';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'נדרשת מדינה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  }

  function updateField(field: keyof SetShippingAddressDto, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  const inputClass =
    'bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/20 focus:border-primary h-10 w-full rounded border px-3 text-sm focus:outline-none focus:ring-2';

  const selectClass =
    'bg-background text-foreground focus:ring-primary/20 focus:border-primary h-10 w-full rounded border px-3 text-sm focus:outline-none focus:ring-2 appearance-none cursor-pointer';

  // Get countries - use server destinations if available
  const countries = useMemo(() => {
    if (hasServerDestinations && destinations?.countries) {
      return destinations.countries.map(c => ({ code: c.code, name: c.name }));
    }
    return FALLBACK_COUNTRIES;
  }, [hasServerDestinations, destinations]);

  // Get regions based on selected country - use server regions if available
  const regions = useMemo(() => {
    if (hasServerDestinations && destinations?.regions?.[formData.country]) {
      return destinations.regions[formData.country].map(r => ({ code: r.code, name: r.name }));
    }
    // Fallback for Israel
    if (formData.country === 'IL') {
      return FALLBACK_ISRAEL_REGIONS;
    }
    return [];
  }, [formData.country, hasServerDestinations, destinations]);

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)} dir="rtl">
      {/* Email */}
      <div>
        <label htmlFor="email" className="text-foreground mb-1 block text-sm font-medium">
          אימייל <span className="text-destructive">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          className={cn(inputClass, errors.email ? 'border-destructive' : 'border-border')}
          placeholder="your@email.com"
        />
        {errors.email && <p className="text-destructive mt-1 text-xs">{errors.email}</p>}
      </div>

      {/* Name row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="text-foreground mb-1 block text-sm font-medium">
            שם פרטי <span className="text-destructive">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            className={cn(inputClass, errors.firstName ? 'border-destructive' : 'border-border')}
          />
          {errors.firstName && <p className="text-destructive mt-1 text-xs">{errors.firstName}</p>}
        </div>

        <div>
          <label htmlFor="lastName" className="text-foreground mb-1 block text-sm font-medium">
            שם משפחה <span className="text-destructive">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            className={cn(inputClass, errors.lastName ? 'border-destructive' : 'border-border')}
          />
          {errors.lastName && <p className="text-destructive mt-1 text-xs">{errors.lastName}</p>}
        </div>
      </div>

      {/* Country + Region row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="country" className="text-foreground mb-1 block text-sm font-medium">
            מדינה <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <select
              id="country"
              value={formData.country}
              onChange={(e) => {
                updateField('country', e.target.value);
                // Clear region when country changes
                if (e.target.value !== formData.country) {
                  updateField('region', '');
                }
              }}
              className={cn(selectClass, errors.country ? 'border-destructive' : 'border-border')}
            >
              <option value="">בחר מדינה</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.country && <p className="text-destructive mt-1 text-xs">{errors.country}</p>}
        </div>

        <div>
          <label htmlFor="region" className="text-foreground mb-1 block text-sm font-medium">
            אזור / מחוז {formData.country === 'IL' && <span className="text-destructive">*</span>}
          </label>
          <div className="relative">
            <select
              id="region"
              value={formData.region || ''}
              onChange={(e) => updateField('region', e.target.value)}
              className={cn(selectClass, 'border-border')}
              disabled={regions.length === 0}
            >
              <option value="">{regions.length > 0 ? 'בחר אזור' : 'לא זמין'}</option>
              {regions.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Address line 1 */}
      <div>
        <label htmlFor="line1" className="text-foreground mb-1 block text-sm font-medium">
          כתובת <span className="text-destructive">*</span>
        </label>
        <input
          id="line1"
          type="text"
          value={formData.line1}
          onChange={(e) => updateField('line1', e.target.value)}
          className={cn(inputClass, errors.line1 ? 'border-destructive' : 'border-border')}
          placeholder="רחוב ומספר"
        />
        {errors.line1 && <p className="text-destructive mt-1 text-xs">{errors.line1}</p>}
      </div>

      {/* Address line 2 */}
      <div>
        <label htmlFor="line2" className="text-foreground mb-1 block text-sm font-medium">
          דירה, קומה וכו׳
        </label>
        <input
          id="line2"
          type="text"
          value={formData.line2 || ''}
          onChange={(e) => updateField('line2', e.target.value)}
          className={cn(inputClass, 'border-border')}
          placeholder="דירה, קומה וכו׳ (אופציונלי)"
        />
      </div>

      {/* City + Postal code row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="text-foreground mb-1 block text-sm font-medium">
            עיר <span className="text-destructive">*</span>
          </label>
          <input
            id="city"
            type="text"
            value={formData.city}
            onChange={(e) => updateField('city', e.target.value)}
            className={cn(inputClass, errors.city ? 'border-destructive' : 'border-border')}
          />
          {errors.city && <p className="text-destructive mt-1 text-xs">{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="postalCode" className="text-foreground mb-1 block text-sm font-medium">
            מיקוד <span className="text-destructive">*</span>
          </label>
          <input
            id="postalCode"
            type="text"
            value={formData.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
            className={cn(inputClass, errors.postalCode ? 'border-destructive' : 'border-border')}
          />
          {errors.postalCode && (
            <p className="text-destructive mt-1 text-xs">{errors.postalCode}</p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="text-foreground mb-1 block text-sm font-medium">
          טלפון
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => updateField('phone', e.target.value)}
          className={cn(inputClass, 'border-border')}
          placeholder="050-1234567 (אופציונלי)"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-primary-foreground w-full rounded px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'שומר...' : 'שמור כתובת'}
      </button>
    </form>
  );
}
