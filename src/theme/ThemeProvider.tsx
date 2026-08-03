import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useData } from '../data/DataProvider';
import {
  DEFAULT_THEME_ID,
  resolveTheme,
  THEMES,
} from './registry';
import type { AppTheme, ThemeId } from './types';

type ThemeContextValue = {
  theme: AppTheme;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { repositories, ready, settings } = useData();
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME_ID);

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (settings?.themeId) {
      setThemeIdState(resolveTheme(settings.themeId).id);
      return;
    }
    if (!repositories) {
      return;
    }
    repositories.settings
      .get()
      .then((row) => {
        setThemeIdState(resolveTheme(row.themeId).id);
      })
      .catch((error) => {
        if (__DEV__) {
          console.error('Failed to load theme setting', error);
        }
      });
  }, [ready, repositories, settings?.themeId]);

  const setThemeId = useCallback(
    async (id: ThemeId) => {
      if (!THEMES[id]) {
        return;
      }
      setThemeIdState(id);
      if (repositories) {
        try {
          await repositories.settings.update({ themeId: id });
        } catch (error) {
          if (__DEV__) {
            console.error('Failed to persist theme', error);
          }
        }
      }
    },
    [repositories],
  );

  const value = useMemo(
    () => ({
      theme: THEMES[themeId],
      themeId,
      setThemeId,
    }),
    [themeId, setThemeId],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): AppTheme {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return value.theme;
}

export function useThemeControls(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useThemeControls must be used within ThemeProvider');
  }
  return value;
}
