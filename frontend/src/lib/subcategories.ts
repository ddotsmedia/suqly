// Subcategory slugs per category. Mirror of backend/src/listings/subcategories.ts — keep in sync.
export interface Subcategory {
  slug: string;
  name: string;
}

export const SUBCATEGORIES: Record<string, Subcategory[]> = {
  goods: [
    { slug: 'electronics', name: 'Electronics' },
    { slug: 'mobile-phones', name: 'Mobile phones' },
    { slug: 'furniture', name: 'Furniture' },
    { slug: 'home-appliances', name: 'Home appliances' },
    { slug: 'fashion', name: 'Fashion' },
    { slug: 'sports-outdoors', name: 'Sports & outdoors' },
    { slug: 'other', name: 'Other' },
  ],
  property: [
    { slug: 'apartments', name: 'Apartments' },
    { slug: 'villas', name: 'Villas' },
    { slug: 'off-plan', name: 'Off-plan' },
    { slug: 'commercial', name: 'Commercial' },
    { slug: 'rooms', name: 'Rooms' },
  ],
  motors: [
    { slug: 'used-cars', name: 'Used cars' },
    { slug: 'new-cars', name: 'New cars' },
    { slug: 'export-cars', name: 'Export cars' },
    { slug: 'rental-cars', name: 'Rental cars' },
    { slug: 'motorcycles', name: 'Motorcycles' },
  ],
  jobs: [
    { slug: 'sales', name: 'Sales' },
    { slug: 'accounting-finance', name: 'Accounting & finance' },
    { slug: 'admin-secretarial', name: 'Admin & secretarial' },
    { slug: 'driver-delivery', name: 'Driver & delivery' },
    { slug: 'other', name: 'Other' },
  ],
  services: [
    { slug: 'home-services', name: 'Home services' },
    { slug: 'professional', name: 'Professional' },
    { slug: 'education', name: 'Education' },
    { slug: 'other', name: 'Other' },
  ],
  businesses: [
    { slug: 'for-sale', name: 'For sale' },
    { slug: 'partnership', name: 'Partnership' },
    { slug: 'franchise', name: 'Franchise' },
  ],
};

export function subcategoriesFor(category: string): Subcategory[] {
  return SUBCATEGORIES[category] ?? [];
}

export function findSubcategory(category: string, slug: string | undefined): Subcategory | undefined {
  if (!slug) return undefined;
  return subcategoriesFor(category).find((s) => s.slug === slug);
}
