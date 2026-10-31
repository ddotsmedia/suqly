import SellerReviewsContent from './client';

export default async function SellerReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SellerReviewsContent id={id} />;
}
