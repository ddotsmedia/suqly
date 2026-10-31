import { notFound, permanentRedirect } from 'next/navigation';
import { findCategory } from '@/lib/site';
import { findSubcategory } from '@/lib/subcategories';

// Subcategory pages reuse the category page's filter (?sub=), so this route
// redirects there instead of rendering duplicate content.
export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ slug: string; subcategory: string }>;
}) {
  const { slug, subcategory } = await params;
  const category = findCategory(slug);
  if (!category) notFound();

  const sub = findSubcategory(category.slug, subcategory);
  if (!sub) notFound();

  permanentRedirect(`/categories/${category.slug}?sub=${sub.slug}`);
}
