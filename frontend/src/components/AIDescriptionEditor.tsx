'use client';

import { useState } from 'react';
import { Loader2, Zap, RefreshCw } from 'lucide-react';

interface GeneratedDescription {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  confidence: number;
}

export default function AIDescriptionEditor({
  listingId,
  onSave,
}: {
  listingId: number;
  onSave: (title: string, description: string) => void;
}) {
  const [generated, setGenerated] = useState<GeneratedDescription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'en' | 'ar'>('en');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/listings/${listingId}/ai-description`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (!response.ok) throw new Error('Failed to generate description');

      const data = await response.json();
      setGenerated(data);
      setEditedTitle(selectedLang === 'en' ? data.title_en : data.title_ar);
      setEditedDescription(
        selectedLang === 'en' ? data.description_en : data.description_ar,
      );
    } catch (error) {
      console.error('Error generating description:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    onSave(editedTitle, editedDescription);
    setIsEditing(false);
  };

  if (!generated) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-start gap-4">
          <Zap className="w-6 h-6 text-purple-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">AI-Powered Descriptions</h3>
            <p className="text-sm text-gray-600 mb-4">
              Let AI analyze your listing images and generate compelling titles and descriptions in English and Arabic
            </p>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate Description
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-gray-900">AI-Generated Description</h3>
            <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
              {(generated.confidence * 100).toFixed(0)}% Confidence
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLang(selectedLang === 'en' ? 'ar' : 'en')}
              className="text-sm font-semibold text-gray-600 hover:text-gray-900"
            >
              {selectedLang === 'en' ? '🇦🇪 عربي' : '🇬🇧 English'}
            </button>
            {!isEditing && (
              <button
                onClick={handleGenerate}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Title</label>
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={255}
            />
          ) : (
            <p className="text-lg font-semibold text-gray-900">{editedTitle}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">{editedTitle.length}/255 characters</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
          {isEditing ? (
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={6}
              maxLength={2000}
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {editedDescription}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">{editedDescription.length}/2000 characters</p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
        {!isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Edit & Use
            </button>
            <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-lg transition-colors">
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              Save Description
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
