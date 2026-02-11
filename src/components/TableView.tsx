import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Heart, Play, Download } from 'lucide-react';
import { MusicRecord } from '../types';

interface TableViewProps {
  records: MusicRecord[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  userSeed: string;
  locale: string;
  averageLikes: number;
}

const TableView: React.FC<TableViewProps> = ({
  records,
  onLoadMore,
  hasMore,
  isLoading,
  userSeed,
  locale,
  averageLikes,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [albumArts, setAlbumArts] = useState<Map<number, string>>(new Map());
  const [audioUrls, setAudioUrls] = useState<Map<number, string>>(new Map());

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
      // Load album art and audio when expanding
      loadMedia(index);
    }
    setExpandedRows(newExpanded);
  };

  const loadMedia = async (index: number) => {
    if (!albumArts.has(index)) {
      try {
        const artResponse = await fetch(
          `http://localhost:3001/api/album-art/${index}?userSeed=${encodeURIComponent(userSeed)}&locale=${locale}&averageLikes=${averageLikes}`
        );
        const artData = await artResponse.json();
        setAlbumArts(new Map(albumArts).set(index, artData.albumArt));
      } catch (error) {
        console.error('Failed to load album art:', error);
      }
    }

    if (!audioUrls.has(index)) {
      try {
        const audioResponse = await fetch(
          `http://localhost:3001/api/audio/${index}?userSeed=${encodeURIComponent(userSeed)}`
        );
        const audioData = await audioResponse.json();
        setAudioUrls(new Map(audioUrls).set(index, audioData.audio));
      } catch (error) {
        console.error('Failed to load audio:', error);
      }
    }
  };

  // Clear media cache when seed or likes change
  useEffect(() => {
    setAlbumArts(new Map());
    setAudioUrls(new Map());
  }, [userSeed, averageLikes]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Song Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Artist
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Album
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Genre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Likes
              </th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <React.Fragment key={record.index}>
                <tr
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => toggleRow(record.index)}
                >
                  <td className="px-4 py-3 text-sm text-gray-500">{record.index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.songTitle}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.artist}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.album}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                      {record.genre}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="flex items-center gap-1">
                      <Heart size={14} className="text-red-500" />
                      {record.likes}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {expandedRows.has(record.index) ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </td>
                </tr>
                {expandedRows.has(record.index) && (
                  <tr>
                    <td colSpan={7} className="px-4 py-4 bg-gray-50">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Album Art */}
                        <div className="flex-shrink-0">
                          {albumArts.has(record.index) ? (
                            <img
                              src={albumArts.get(record.index)}
                              alt={record.songTitle}
                              className="w-48 h-48 rounded-lg shadow-md"
                            />
                          ) : (
                            <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400">Loading...</span>
                            </div>
                          )}
                        </div>

                        {/* Details and Audio */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{record.songTitle}</h3>
                            <p className="text-gray-600">{record.artist}</p>
                            <p className="text-sm text-gray-500">Album: {record.album}</p>
                          </div>

                          {audioUrls.has(record.index) && (
                            <div className="space-y-2">
                              <audio
                                controls
                                src={audioUrls.get(record.index)}
                                className="w-full max-w-md"
                              />
                              <div className="flex gap-2">
                                <a
                                  href={audioUrls.get(record.index)}
                                  download={`${record.songTitle}.wav`}
                                  className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                  <Download size={16} />
                                  Download Audio
                                </a>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Heart size={16} className="text-red-500" />
                              {record.likes} likes
                            </span>
                            <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                              {record.genre}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TableView;