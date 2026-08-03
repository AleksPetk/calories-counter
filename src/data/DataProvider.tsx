import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { Settings } from '../types';
import { applyHistoryRetention } from './history/historyRetention';
import { initDatabase, type DataRepositories } from './index';
import { seedDevLibraryIfEmpty } from './seed/seedDevData';

type DataContextValue = {
  ready: boolean;
  error: string | null;
  repositories: DataRepositories | null;
  settings: Settings | null;
  revision: number;
  /** Bump revision so library + log consumers reload. */
  refresh: () => void;
  /** @deprecated Prefer `refresh`. */
  refreshLibrary: () => void;
  reloadSettings: () => Promise<void>;
  /** Force-show tutorial without clearing user data. */
  requestTutorialReplay: () => void;
  tutorialReplayToken: number;
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<DataRepositories | null>(
    null,
  );
  const [settings, setSettings] = useState<Settings | null>(null);
  const [revision, setRevision] = useState(0);
  const [tutorialReplayToken, setTutorialReplayToken] = useState(0);

  const reloadSettings = useCallback(async () => {
    if (!repositories) {
      return;
    }
    const next = await repositories.settings.get();
    setSettings(next);
  }, [repositories]);

  const requestTutorialReplay = useCallback(() => {
    setTutorialReplayToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { repositories: repos } = await initDatabase();
        if (__DEV__) {
          await seedDevLibraryIfEmpty(repos);
        }
        const nextSettings = await repos.settings.get();
        await applyHistoryRetention(repos, nextSettings);
        if (!cancelled) {
          setRepositories(repos);
          setSettings(nextSettings);
          setReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setReady(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(() => {
    setRevision((value) => value + 1);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      error,
      repositories,
      settings,
      revision,
      refresh,
      refreshLibrary: refresh,
      reloadSettings,
      requestTutorialReplay,
      tutorialReplayToken,
    }),
    [
      ready,
      error,
      repositories,
      settings,
      revision,
      refresh,
      reloadSettings,
      requestTutorialReplay,
      tutorialReplayToken,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const value = useContext(DataContext);
  if (!value) {
    throw new Error('useData must be used within DataProvider');
  }
  return value;
}
