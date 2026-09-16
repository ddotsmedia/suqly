import VisualSearchUpload from '@/components/VisualSearchUpload';

export const metadata = {
  title: 'Visual Search - Suqly',
  description: 'Search for items using images',
};

export default function VisualSearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Visual Search</h1>
          <p className="text-blue-100 text-lg">
            Upload or drag an image to find similar items on Suqly
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <VisualSearchUpload />

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl mb-3">🖼️</div>
            <h3 className="font-bold text-gray-900 mb-2">Smart Recognition</h3>
            <p className="text-sm text-gray-600">
              AI analyzes your image to identify similar items instantly
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold text-gray-900 mb-2">Fast Results</h3>
            <p className="text-sm text-gray-600">
              Get relevant listings in seconds with similarity scores
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-bold text-gray-900 mb-2">Best Deals</h3>
            <p className="text-sm text-gray-600">
              Compare prices on visually similar items instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
