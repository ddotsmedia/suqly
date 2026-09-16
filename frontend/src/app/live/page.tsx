import { Loader2 } from 'lucide-react';
import LiveSessionCard from '@/components/LiveSessionCard';

interface LiveSession {
  id: number;
  title: string;
  sellerName: string;
  status: 'live' | 'scheduled';
  viewerCount: number;
  thumbnail?: string;
  startTime?: string;
  category?: string;
}

async function getLiveSessions(): Promise<LiveSession[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/live-sessions`, {
      cache: 'no-store',
    });
    return res.json();
  } catch {
    return [];
  }
}

export default async function LivePage() {
  const sessions = await getLiveSessions();

  const liveSessions = sessions.filter((s) => s.status === 'live');
  const scheduledSessions = sessions.filter((s) => s.status === 'scheduled');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Live Selling</h1>
          <p className="text-red-100 text-lg">
            Join sellers in real-time livestreams and shop exclusive deals
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Live Now Section */}
        {liveSessions.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <h2 className="text-3xl font-bold text-gray-900">Live Now ({liveSessions.length})</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {liveSessions.map((session) => (
                <LiveSessionCard key={session.id} session={session} />
              ))}
            </div>
          </section>
        )}

        {/* Scheduled Sessions */}
        {scheduledSessions.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Upcoming Sessions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {scheduledSessions.map((session) => (
                <LiveSessionCard key={session.id} session={session} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {sessions.length === 0 && (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 text-lg">Loading live sessions...</p>
          </div>
        )}
      </div>
    </div>
  );
}
