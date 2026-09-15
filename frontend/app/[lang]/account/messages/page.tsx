'use client';

import { useState, useEffect } from 'react';

export default function MessagesPage({ params }: { params: { lang: string } }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          window.location.href = `/${params.lang}`;
          return;
        }

        const response = await fetch('http://localhost:3001/messages/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setConversations(data.data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (loading) return <div className="container py-12">Loading...</div>;

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>

      {conversations.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg">No conversations yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">Conversation {idx + 1}</h3>
                <span className="text-sm text-gray-600">
                  {new Date(conv.lastMessage?.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600 line-clamp-2">
                {conv.lastMessage?.content || 'No messages'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
