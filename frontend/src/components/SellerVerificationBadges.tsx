'use client';

import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface VerificationStatus {
  verified_id: boolean;
  verified_bank: boolean;
  verified_phone: boolean;
  fraud_score: number;
  risk_level: 'low' | 'medium' | 'high';
}

export default function SellerVerificationBadges({
  verification,
}: {
  verification: VerificationStatus;
}) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRiskBg = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-50';
      case 'medium':
        return 'bg-yellow-50';
      case 'high':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Verification Badges */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Seller Verification</h3>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          {verification.verified_id ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
          <span className={verification.verified_id ? 'text-gray-900' : 'text-gray-600'}>
            {verification.verified_id ? '✓ ID Verified' : 'ID Verification Pending'}
          </span>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          {verification.verified_bank ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
          <span className={verification.verified_bank ? 'text-gray-900' : 'text-gray-600'}>
            {verification.verified_bank ? '✓ Bank Verified' : 'Bank Verification Pending'}
          </span>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          {verification.verified_phone ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
          <span className={verification.verified_phone ? 'text-gray-900' : 'text-gray-600'}>
            {verification.verified_phone ? '✓ Phone Verified' : 'Phone Verification Pending'}
          </span>
        </div>
      </div>

      {/* Trust Score */}
      <div className={`rounded-lg p-4 border ${getRiskBg(verification.risk_level)}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Trust Score</h3>
          <span className={`font-bold text-lg ${getRiskColor(verification.risk_level)}`}>
            {(100 - verification.fraud_score).toFixed(0)}/100
          </span>
        </div>
        <p className={`text-sm font-semibold ${getRiskColor(verification.risk_level)}`}>
          {verification.risk_level === 'low' && '✓ Trusted Seller'}
          {verification.risk_level === 'medium' && '⚠ Some Risk'}
          {verification.risk_level === 'high' && '✗ High Risk - Use Caution'}
        </p>

        {verification.risk_level !== 'low' && (
          <button className="mt-3 w-full text-sm font-semibold text-blue-600 hover:text-blue-700">
            Learn More →
          </button>
        )}
      </div>

      {/* Recommendation */}
      {verification.verified_id && verification.verified_bank && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            This seller is fully verified and has proven their identity and bank account.
          </p>
        </div>
      )}
    </div>
  );
}
