export interface AttributeSchema {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  required?: boolean;
  options?: string[];
}

export const LISTING_ATTRIBUTES: Record<string, AttributeSchema[]> = {
  motors: [
    { key: 'year', label: 'Year', type: 'number', required: true },
    { key: 'mileage', label: 'Mileage (km)', type: 'number' },
    { key: 'fuel', label: 'Fuel Type', type: 'select', options: ['petrol', 'diesel', 'hybrid', 'electric'] },
    { key: 'transmission', label: 'Transmission', type: 'select', options: ['manual', 'automatic'] },
  ],
  property: [
    { key: 'bedrooms', label: 'Bedrooms', type: 'number', required: true },
    { key: 'size_sqm', label: 'Size (sqm)', type: 'number' },
    { key: 'furnishing', label: 'Furnishing', type: 'select', options: ['unfurnished', 'semi-furnished', 'furnished'] },
    { key: 'type', label: 'Type', type: 'select', options: ['apartment', 'villa', 'townhouse', 'studio'] },
  ],
  goods: [
    { key: 'condition', label: 'Condition', type: 'select', options: ['new', 'like-new', 'good', 'fair'] },
  ],
  jobs: [
    { key: 'experience', label: 'Experience Required', type: 'select', options: ['entry-level', 'mid-level', 'senior'] },
    { key: 'employment_type', label: 'Employment Type', type: 'select', options: ['full-time', 'part-time', 'contract'] },
  ],
  services: [
    { key: 'experience', label: 'Years of Experience', type: 'number' },
  ],
  businesses: [
    { key: 'established_year', label: 'Established Year', type: 'number' },
  ],
};

export function getAttributeSchema(category: string): AttributeSchema[] {
  return LISTING_ATTRIBUTES[category] || [];
}
