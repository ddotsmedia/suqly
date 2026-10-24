// Allowed subcategory slugs per category. Keep in sync with frontend/src/lib/subcategories.ts.
export const SUBCATEGORIES: Record<string, string[]> = {
  goods: ['electronics', 'mobile-phones', 'furniture', 'home-appliances', 'fashion', 'sports-outdoors', 'other'],
  property: ['apartments', 'villas', 'off-plan', 'commercial', 'rooms'],
  motors: ['used-cars', 'new-cars', 'export-cars', 'rental-cars', 'motorcycles'],
  jobs: ['sales', 'accounting-finance', 'admin-secretarial', 'driver-delivery', 'other'],
  services: ['home-services', 'professional', 'education', 'other'],
  businesses: ['for-sale', 'partnership', 'franchise'],
};

export function isValidSubcategory(category: string, subcategory: string): boolean {
  return (SUBCATEGORIES[category] ?? []).includes(subcategory);
}
