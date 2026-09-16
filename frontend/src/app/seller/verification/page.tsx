'use client';

import { useState } from 'react';
import { CheckCircle, Upload } from 'lucide-react';
import SellerVerificationBadges from '@/components/SellerVerificationBadges';

interface VerificationStatus {
  verified_id: boolean;
  verified_bank: boolean;
  verified_phone: boolean;
  fraud_score: number;
  risk_level: 'low' | 'medium' | 'high';
}

export default function SellerVerificationPage() {
  const [verification, setVerification] = useState<VerificationStatus>({
    verified_id: false,
    verified_bank: false,
    verified_phone: true,
    fraud_score: 15,
    risk_level: 'low',
  });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    if (!e.target.files?.[0]) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      formData.append('docType', docType);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sellers/verify-identity`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (response.ok) {
        setVerification((prev) => ({
          ...prev,
          verified_id: docType !== 'bank',
          verified_bank: docType === 'bank',
          fraud_score: Math.max(prev.fraud_score - 20, 0),
        }));
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const completionPercentage = [
    verification.verified_phone,
    verification.verified_id,
    verification.verified_bank,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Seller Verification</h1>
          <p className="text-lg text-gray-600">
            Complete your verification to build trust and increase sales
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <SellerVerificationBadges verification={verification} />

            {/* Progress Bar */}
            <div className="mt-8 bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Verification</span>
                    <span className="text-sm font-bold text-blue-600">
                      {completionPercentage}/3
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(completionPercentage / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Phone Verification */}
              <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    {verification.verified_phone ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0"></div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900">Phone Verification</h3>
                      <p className="text-sm text-gray-600">Verify your phone number</p>
                    </div>
                  </div>
                  {verification.verified_phone && (
                    <span className="text-sm font-semibold text-green-600">✓ Verified</span>
                  )}
                </div>
              </div>

              {/* ID Verification */}
              <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    {verification.verified_id ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0"></div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900">ID Verification</h3>
                      <p className="text-sm text-gray-600">Upload passport or Emirates ID</p>
                    </div>
                  </div>
                  {verification.verified_id && (
                    <span className="text-sm font-semibold text-green-600">✓ Verified</span>
                  )}
                </div>

                {!verification.verified_id && (
                  <div className="space-y-4">
                    <label className="block">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="font-semibold text-gray-700">Upload ID Document</p>
                        <p className="text-sm text-gray-600">PDF, PNG, or JPG (Max 5MB)</p>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'emirates_id')}
                          accept="image/*,.pdf"
                          disabled={uploading}
                        />
                      </div>
                    </label>
                    {uploading && <p className="text-sm text-blue-600">Uploading...</p>}
                  </div>
                )}
              </div>

              {/* Bank Verification */}
              <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    {verification.verified_bank ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0"></div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900">Bank Account Verification</h3>
                      <p className="text-sm text-gray-600">Verify your bank IBAN</p>
                    </div>
                  </div>
                  {verification.verified_bank && (
                    <span className="text-sm font-semibold text-green-600">✓ Verified</span>
                  )}
                </div>

                {!verification.verified_bank && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="AE270030100000300001111111"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
                      Verify Bank Account
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
