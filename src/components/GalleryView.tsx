import React, { useState, useEffect, useRef } from 'react';
import { Heart, Play, Music } from 'lucide-react';
import { MusicRecord } from '../types';

interface GalleryViewProps {
  records: MusicRecord[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  userSeed: string;
  locale: string;
  averageLikes: number;
}

const GalleryView: React.FC<GalleryViewProps> = ({
  records,
  onLoadMore,
  hasMore,
  isLoading,
  userSeed,
  locale,
  averageLikes,
}) => {
  const [albumArts, setAlbumArts] = useState<Map<number, string>>(new Map());
  const [audioUrls, setAudioUrls] = useState<Map<number, string>>(new Map());
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, isLoading, onLoadMore]);

  // Load album art for visible cards
  useEffect(() => {
    const loadVisibleAlbumArts = async () => {
      for (const record of records) {
        if (!albumArts.has(record.index)) {
          try {
            const response = await fetch(
              `http://localhost:3001/api/album-art/${record.index}?userSeed=${encodeURIComponent(userSeed)}&locale=${locale}&averageLikes=${averageLikes}`
            );
            const data = await response.json();
            setAlbumArts((prev) => new Map(prev).set(record.index, data.albumArt));
          } catch (error) {
            console.error('Failed to load album art:', error);
          }
        }
      }
    };

    loadVisibleAlbumArts();
  }, [records, userSeed, locale, averageLikes]);

  const loadAudio = async (index: number) => {
    if (!audioUrls.has(index)) {
      try {
        const response = await fetch(
          `http://localhost:3001/api/audio/${index}?userSeed=${encodeURIComponent(userSeed)}`
        );
        const data = await response.json();
        setAudioUrls((prev) => new Map(prev).set(index, data.audio));
      } catch (error) {
        console.error('Failed to load audio:', error);
      }
    }
  };

  const handleCardClick = (index: number) => {
    setSelectedRecord(selectedRecord === index ? null : index);
    if (selectedRecord !== index) {
      loadAudio(index);
    }
  };

  // Clear cache when seed or likes change
  useEffect(() => {
    setAlbumArts(new Map());
    setAudioUrls(new Map());
    setSelectedRecord(null);
  }, [userSeed, averageLikes]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {records.map((record) => (
          <div
            key={record.index}
            className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
              selectedRecord === record.index ? 'ring-4 ring-purple-500' : ''
            }`}
            onClick={() => handleCardClick(record.index)}
          >
            {/* Album Art */}
            <div className="relative aspect-square bg-gray-200">
              {albumArts.has(record.index) ? (
                <img
                  src={albumArts.get(record.index)}
                  alt={record.songTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music size={48} className="text-gray-400" />
                </div>
              )}
              {selectedRecord === record.index && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <Play size={64} className="text-white" />
                </div>
              )}
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-2">
              <h3 className="font-bold text-gray-900 truncate" title={record.songTitle}>
                {record.songTitle}
              </h3>
              <p className="text-sm text-gray-600 truncate" title={record.artist}>
                {record.artist}
              </p>
              <p className="text-xs text-gray-500 truncate">{record.album}</p>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                  {record.genre}
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-700">
                  <Heart size={14} className="text-red-500" />
                  {record.likes}
                </div>
              </div>

              {/* Audio Player (shown when selected) */}
              {selectedRecord === record.index && audioUrls.has(record.index) && (
                <div className="pt-3 border-t mt-3">
                  <audio
                    controls
                    src={audioUrls.get(record.index)}
                    className="w-full"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-8">
        {isLoading && (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="text-gray-500 text-sm">Loading more...</span>
          </div>
        )}
        {!hasMore && records.length > 0 && (
          <span className="text-gray-400 text-sm">No more records</span>
        )}
      </div>
    </div>
  );
};

export default GalleryView;