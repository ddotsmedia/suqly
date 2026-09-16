'use client';

import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface PriceSuggestion {
  suggestedPrice: number;
  currentPrice: number;
  marketAverage: number;
  marketMin: number;
  marketMax: number;
  confidence: number;
}

export default function PriceSuggestionCard({
  suggestion,
}: {
  suggestion: PriceSuggestion;
}) {
  const difference = suggestion.suggestedPrice - suggestion.currentPrice;
  const percentChange = ((difference / suggestion.currentPrice) * 100).toFixed(1);
  const isHigher = difference > 0;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">AI Price Suggestion</h3>
          <p className="text-sm text-gray-600">Based on {suggestion.confidence.toFixed(0)}% confidence</p>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold">
          {isHigher ? (
            <>
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600">+{percentChange}%</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-red-600">{percentChange}%</span>
            </>
          )}
        </div>
      </div>

      {/* Main Suggestion */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Suggested Price</p>
            <p className="text-4xl font-bold text-blue-600">
              AED {suggestion.suggestedPrice.toLocaleString()}
            </p>
            {suggestion.currentPrice > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Your current: AED {suggestion.currentPrice.toLocaleString()}
              </p>
            )}
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
            Update Price
          </button>
        </div>
      </div>

      {/* Market Range */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Minimum</p>
          <p className="text-lg font-bold text-gray-900">
            AED {suggestion.marketMin.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Average</p>
          <p className="text-lg font-bold text-gray-900">
            AED {suggestion.marketAverage.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Maximum</p>
          <p className="text-lg font-bold text-gray-900">
            AED {suggestion.marketMax.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          {isHigher
            ? `You could increase your price by AED ${Math.abs(difference).toLocaleString()} to match market demand`
            : `Consider lowering your price to improve competitiveness in the market`}
        </p>
      </div>
    </div>
  );
}
