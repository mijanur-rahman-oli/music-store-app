import React, { useState, useEffect, useCallback } from 'react';
import Toolbar from './components/Toolbar';
import TableView from './components/TableView';
import GalleryView from './components/GalleryView';
import { MusicRecord, AppState } from './types';

const API_BASE_URL = 'http://localhost:3001';
const PAGE_SIZE = 20;

function App() {
  const [appState, setAppState] = useState<AppState>({
    locale: 'en-US',
    userSeed: 'default',
    averageLikes: 5.0,
    viewMode: 'table',
  });

  const [records, setRecords] = useState<MusicRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchRecords = useCallback(
    async (page: number, reset: boolean = false) => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/records?userSeed=${encodeURIComponent(
            appState.userSeed
          )}&page=${page}&pageSize=${PAGE_SIZE}&locale=${appState.locale}&averageLikes=${
            appState.averageLikes
          }`
        );
        const data = await response.json();

        if (reset) {
          setRecords(data.records);
          setCurrentPage(0);
        } else {
          setRecords((prev) => [...prev, ...data.records]);
        }

        // For infinite scroll, we'll keep loading
        setHasMore(true);
      } catch (error) {
        console.error('Failed to fetch records:', error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [appState.userSeed, appState.locale, appState.averageLikes]
  );

  // Reset and load initial data when parameters change
  useEffect(() => {
    setRecords([]);
    setCurrentPage(0);
    setHasMore(true);
    fetchRecords(0, true);
  }, [appState.userSeed, appState.locale, appState.averageLikes, fetchRecords]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchRecords(nextPage, false);
    }
  };

  const handleStateChange = (newState: Partial<AppState>) => {
    setAppState((prev) => ({ ...prev, ...newState }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toolbar state={appState} onStateChange={handleStateChange} />

      {appState.viewMode === 'table' ? (
        <TableView
          records={records}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoading={isLoading}
          userSeed={appState.userSeed}
          locale={appState.locale}
          averageLikes={appState.averageLikes}
        />
      ) : (
        <GalleryView
          records={records}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoading={isLoading}
          userSeed={appState.userSeed}
          locale={appState.locale}
          averageLikes={appState.averageLikes}
        />
      )}
    </div>
  );
}

export default App;