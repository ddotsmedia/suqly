'use client';

import { Loader2, Play, Users } from 'lucide-react';
import Link from 'next/link';

interface LiveSession {
  id: number;
  title: string;
  sellerName: string;
  sellerAvatar?: string;
  status: 'scheduled' | 'live' | 'ended';
  viewerCount: number;
  thumbnail?: string;
  startTime?: string;
  category?: string;
}

export default function LiveSessionCard({ session }: { session: LiveSession }) {
  const isLive = session.status === 'live';
  const scheduled = session.status === 'scheduled';

  return (
    <Link href={`/live/${session.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden h-full cursor-pointer">
        {/* Thumbnail */}
        <div className="relative bg-gray-900 aspect-video">
          {session.thumbnail ? (
            <img
              src={session.thumbnail}
              alt={session.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <Play className="w-12 h-12 text-gray-600" />
            </div>
          )}

          {/* Status Badge */}
          {isLive && (
            <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              LIVE
            </div>
          )}

          {scheduled && (
            <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Scheduled
            </div>
          )}

          {/* Viewer Count */}
          {isLive && (
            <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              {session.viewerCount.toLocaleString()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 line-clamp-2 mb-2">{session.title}</h3>

          {/* Seller Info */}
          <div className="flex items-center gap-3 mb-3">
            {session.sellerAvatar && (
              <img
                src={session.sellerAvatar}
                alt={session.sellerName}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="text-sm">
              <p className="font-semibold text-gray-900">{session.sellerName}</p>
              {session.category && (
                <p className="text-gray-600 text-xs">{session.category}</p>
              )}
            </div>
          </div>

          {/* Action Button */}
          {isLive && (
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors">
              Join Live
            </button>
          )}

          {scheduled && (
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors">
              Set Reminder
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
