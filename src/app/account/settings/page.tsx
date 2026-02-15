'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  User,
  Heart,
  Settings,
  LogOut,
  Loader2,
  ChevronRight,
  Save,
  Lock,
  Mail,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { omni } from '@/lib/omni-sync';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

interface AddressFormData {
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading: authLoading, logout, updateProfile, clearError, error } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Address management state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    postalCode: '',
    country: 'IL',
    isDefault: false,
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressSuccessMessage, setAddressSuccessMessage] = useState('');

  // Populate form with current customer data
  useEffect(() => {
    if (customer) {
      setFirstName(customer.firstName || '');
      setLastName(customer.lastName || '');
      setPhone(customer.phone || '');
    }
  }, [customer]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/account/settings');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load addresses
  useEffect(() => {
    async function loadAddresses() {
      if (!isAuthenticated) return;
      setIsLoadingAddresses(true);
      try {
        const addressList = await omni.getMyAddresses();
        setAddresses(addressList as Address[]);
      } catch (err) {
        console.error('Failed to load addresses:', err);
      } finally {
        setIsLoadingAddresses(false);
      }
    }
    loadAddresses();
  }, [isAuthenticated]);

  // Reset address form
  const resetAddressForm = () => {
    setAddressForm({
      firstName: customer?.firstName || '',
      lastName: customer?.lastName || '',
      phone: customer?.phone || '',
      line1: '',
      line2: '',
      city: '',
      postalCode: '',
      country: 'IL',
      isDefault: addresses.length === 0,
    });
    setEditingAddress(null);
    setAddressError(null);
  };

  // Open form for new address
  const handleAddNewAddress = () => {
    resetAddressForm();
    setShowAddressForm(true);
  };

  // Open form for editing address
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      phone: address.phone || '',
      line1: address.line1 || '',
      line2: address.line2 || '',
      city: address.city || '',
      postalCode: address.postalCode || '',
      country: address.country || 'IL',
      isDefault: address.isDefault || false,
    });
    setAddressError(null);
    setShowAddressForm(true);
  };

  // Save address (create or update)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);
    setAddressError(null);
    setAddressSuccessMessage('');

    try {
      if (editingAddress) {
        // Update existing address
        await omni.updateMyAddress(editingAddress.id, addressForm);
        setAddressSuccessMessage('הכתובת עודכנה בהצלחה');
      } else {
        // Create new address
        await omni.addMyAddress(addressForm);
        setAddressSuccessMessage('הכתובת נוספה בהצלחה');
      }

      // Reload addresses
      const addressList = await omni.getMyAddresses();
      setAddresses(addressList as Address[]);

      setShowAddressForm(false);
      setTimeout(() => setAddressSuccessMessage(''), 3000);
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : 'שגיאה בשמירת הכתובת');
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('האם למחוק כתובת זו?')) return;

    try {
      await omni.deleteMyAddress(addressId);
      setAddresses(addresses.filter(a => a.id !== addressId));
      setAddressSuccessMessage('הכתובת נמחקה בהצלחה');
      setTimeout(() => setAddressSuccessMessage(''), 3000);
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : 'שגיאה במחיקת הכתובת');
    }
  };

  // Set default address
  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await omni.updateMyAddress(addressId, { isDefault: true });
      // Reload addresses
      const addressList = await omni.getMyAddresses();
      setAddresses(addressList as Address[]);
      setAddressSuccessMessage('כתובת ברירת המחדל עודכנה');
      setTimeout(() => setAddressSuccessMessage(''), 3000);
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : 'שגיאה בעדכון כתובת ברירת המחדל');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    clearError();
    setIsSaving(true);

    const success = await updateProfile({ firstName, lastName, phone });

    if (success) {
      setSuccessMessage('הפרטים נשמרו בהצלחה');
      setTimeout(() => setSuccessMessage(''), 3000);
    }

    setIsSaving(false);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-primary text-primary-foreground pt-32 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">הגדרות חשבון</h1>
          <p className="text-primary-foreground/70">עדכן את הפרטים האישיים שלך</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-background rounded-xl p-4 space-y-1">
              <Link
                href="/account/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Package className="h-5 w-5" />
                ההזמנות שלי
              </Link>
              <Link
                href="/favorites"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Heart className="h-5 w-5" />
                מועדפים
              </Link>
              <Link
                href="/account/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
              >
                <Settings className="h-5 w-5" />
                הגדרות
              </Link>
              <Separator className="my-2" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors w-full text-destructive cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                התנתקות
              </button>
            </nav>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">פרטים אישיים</h2>
                  <p className="text-sm text-muted-foreground">עדכן את שמך ופרטי הקשר</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">שם פרטי</label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">שם משפחה</label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">אימייל</label>
                  <Input value={customer?.email || ''} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground mt-1">
                    לא ניתן לשנות את כתובת האימייל
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">טלפון</label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="050-0000000"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 text-sm">
                    {successMessage}
                  </div>
                )}

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 me-2 animate-spin" />
                      שומר...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 me-2" />
                      שמור שינויים
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Password section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-background rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">סיסמה</h2>
                  <p className="text-sm text-muted-foreground">שנה את סיסמת החשבון שלך</p>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">
                לשינוי הסיסמה, נשלח לך קישור לאיפוס סיסמה לכתובת האימייל שלך.
              </p>

              <Button variant="outline" asChild>
                <Link href="/forgot-password">
                  <Mail className="h-4 w-4 me-2" />
                  שלח קישור לאיפוס סיסמה
                </Link>
              </Button>
            </motion.div>

            {/* Address management section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-background rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">כתובות משלוח</h2>
                    <p className="text-sm text-muted-foreground">נהל את כתובות המשלוח שלך</p>
                  </div>
                </div>
                {!showAddressForm && (
                  <Button variant="outline" size="sm" onClick={handleAddNewAddress}>
                    <Plus className="h-4 w-4 me-2" />
                    הוסף כתובת
                  </Button>
                )}
              </div>

              {addressError && (
                <div className="p-3 mb-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                  {addressError}
                </div>
              )}

              {addressSuccessMessage && (
                <div className="p-3 mb-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 text-sm">
                  {addressSuccessMessage}
                </div>
              )}

              {/* Address form */}
              {showAddressForm && (
                <form onSubmit={handleSaveAddress} className="space-y-4 mb-6 p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">
                      {editingAddress ? 'עריכת כתובת' : 'הוספת כתובת חדשה'}
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddressForm(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">שם פרטי</label>
                      <Input
                        value={addressForm.firstName}
                        onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">שם משפחה</label>
                      <Input
                        value={addressForm.lastName}
                        onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">טלפון</label>
                    <Input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="050-0000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">כתובת (רחוב ומספר)</label>
                    <Input
                      value={addressForm.line1}
                      onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">דירה / קומה (אופציונלי)</label>
                    <Input
                      value={addressForm.line2}
                      onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">עיר</label>
                      <Input
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">מיקוד</label>
                      <Input
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">הגדר ככתובת ברירת מחדל</span>
                  </label>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddressForm(false)}
                    >
                      ביטול
                    </Button>
                    <Button type="submit" disabled={isSavingAddress}>
                      {isSavingAddress ? (
                        <>
                          <Loader2 className="h-4 w-4 me-2 animate-spin" />
                          שומר...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 me-2" />
                          {editingAddress ? 'עדכן כתובת' : 'שמור כתובת'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* Address list */}
              {isLoadingAddresses ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>עדיין לא הוספת כתובות</p>
                  <p className="text-sm">הוסף כתובת משלוח כדי להקל על תהליך ההזמנה</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {address.firstName} {address.lastName}
                            </span>
                            {address.isDefault && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                <Star className="h-3 w-3" />
                                ברירת מחדל
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {address.line1}
                            {address.line2 && `, ${address.line2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.postalCode}
                          </p>
                          {address.phone && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {address.phone}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {!address.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetDefaultAddress(address.id)}
                              title="הגדר כברירת מחדל"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAddress(address)}
                            title="ערוך"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-destructive hover:text-destructive"
                            title="מחק"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Back link */}
            <div className="flex justify-center">
              <Link
                href="/account"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
                חזרה לחשבון
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
