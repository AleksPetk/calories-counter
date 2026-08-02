import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useData } from '../data/DataProvider';
import { navigateToTab } from '../navigation/navigationRef';
import {
  cleanupTutorialArtifacts,
  ensureTutorialDemoItem,
} from './cleanup';
import { SpotlightOverlay } from './SpotlightOverlay';
import { TUTORIAL_STEPS } from './steps';
import type {
  AnchorRect,
  TutorialAction,
  TutorialTab,
  TutorialTargetId,
} from './types';

type MeasureFn = () => Promise<AnchorRect | null>;

type TutorialContextValue = {
  active: boolean;
  registerTarget: (id: TutorialTargetId, measure: MeasureFn) => void;
  unregisterTarget: (id: TutorialTargetId, measure: MeasureFn) => void;
  notifyAction: (action: TutorialAction) => void;
};

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function useTutorial(): TutorialContextValue {
  const value = useContext(TutorialContext);
  if (!value) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return value;
}

export function useTutorialOptional(): TutorialContextValue | null {
  return useContext(TutorialContext);
}

type TutorialProviderProps = {
  children: ReactNode;
  visible: boolean;
  onFinished: () => void;
};

export function TutorialProvider({
  children,
  visible,
  onFinished,
}: TutorialProviderProps) {
  const { repositories, refresh, ready } = useData();
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [hole, setHole] = useState<AnchorRect | null>(null);
  const targetsRef = useRef<Map<TutorialTargetId, MeasureFn>>(new Map());
  const finishingRef = useRef(false);
  const stepIndexRef = useRef(0);
  const runningRef = useRef(false);
  const lastTabRef = useRef<TutorialTab | null>(null);
  const repositoriesRef = useRef(repositories);
  const refreshRef = useRef(refresh);
  const onFinishedRef = useRef(onFinished);

  const step = TUTORIAL_STEPS[stepIndex] ?? TUTORIAL_STEPS[0];

  useEffect(() => {
    stepIndexRef.current = stepIndex;
  }, [stepIndex]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    repositoriesRef.current = repositories;
  }, [repositories]);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  const remeasure = useCallback(async () => {
    const targetId = TUTORIAL_STEPS[stepIndexRef.current]?.targetId;
    if (!targetId) {
      setHole(null);
      return;
    }
    const measure = targetsRef.current.get(targetId);
    if (!measure) {
      setHole(null);
      return;
    }
    try {
      const rect = await measure();
      setHole(rect);
    } catch {
      setHole(null);
    }
  }, []);

  const registerTarget = useCallback(
    (id: TutorialTargetId, measure: MeasureFn) => {
      targetsRef.current.set(id, measure);
      const needed = TUTORIAL_STEPS[stepIndexRef.current]?.targetId;
      if (needed === id && runningRef.current) {
        requestAnimationFrame(() => {
          void remeasure();
        });
        setTimeout(() => {
          void remeasure();
        }, 50);
      }
    },
    [remeasure],
  );

  const unregisterTarget = useCallback(
    (id: TutorialTargetId, measure: MeasureFn) => {
      if (targetsRef.current.get(id) === measure) {
        targetsRef.current.delete(id);
      }
    },
    [],
  );

  const finishTutorial = useCallback(async () => {
    if (finishingRef.current) {
      return;
    }
    finishingRef.current = true;
    runningRef.current = false;
    setRunning(false);
    setHole(null);
    setStepIndex(0);
    lastTabRef.current = null;
    const repos = repositoriesRef.current;
    if (repos) {
      try {
        await cleanupTutorialArtifacts(repos);
        refreshRef.current();
      } catch (error) {
        console.error('Tutorial cleanup failed', error);
      }
    }
    onFinishedRef.current();
    finishingRef.current = false;
  }, []);

  const advance = useCallback(() => {
    if (finishingRef.current || !runningRef.current) {
      return;
    }
    const current = stepIndexRef.current;
    const nextIndex = current + 1;
    if (nextIndex >= TUTORIAL_STEPS.length) {
      void finishTutorial();
      return;
    }
    stepIndexRef.current = nextIndex;
    setStepIndex(nextIndex);
  }, [finishTutorial]);

  // Stable notifyAction — must not recreate context every step (anchors would churn).
  const notifyAction = useCallback((action: TutorialAction) => {
    if (!runningRef.current || finishingRef.current) {
      return;
    }
    const current = TUTORIAL_STEPS[stepIndexRef.current];
    if (!current || current.advanceOn !== 'action') {
      return;
    }
    if (current.action === action) {
      advance();
    }
  }, [advance]);

  // Sync running with parent visibility.
  useEffect(() => {
    if (!visible || !ready) {
      if (!visible) {
        runningRef.current = false;
        setRunning(false);
        setHole(null);
        lastTabRef.current = null;
      }
      return;
    }
    finishingRef.current = false;
    lastTabRef.current = null;
    stepIndexRef.current = 0;
    setStepIndex(0);
    runningRef.current = true;
    setRunning(true);
  }, [visible, ready]);

  // Navigate only when the tab actually changes (same-tab re-navigate dismisses stacks).
  useEffect(() => {
    if (!running) {
      return;
    }
    const current = TUTORIAL_STEPS[stepIndex];
    if (!current) {
      return;
    }

    if (current.tab && lastTabRef.current !== current.tab) {
      navigateToTab(current.tab);
      lastTabRef.current = current.tab;
    }

    let cancelled = false;
    (async () => {
      const repos = repositoriesRef.current;
      if (
        repos &&
        (current.id === 'home-pins' || current.id === 'logging')
      ) {
        await ensureTutorialDemoItem(repos);
        if (!cancelled) {
          refreshRef.current();
        }
      }
    })();

    // Clear stale hole immediately; remeasure after layout / tab transition.
    setHole(null);
    const timers = [50, 200, 450, 800].map((ms) =>
      setTimeout(() => {
        if (!cancelled) {
          void remeasure();
        }
      }, ms),
    );

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [running, stepIndex, remeasure]);

  // Stable context — register/unregister/notifyAction identities must not churn.
  const contextValue = useMemo(
    () => ({
      active: running,
      registerTarget,
      unregisterTarget,
      notifyAction,
    }),
    [running, registerTarget, unregisterTarget, notifyAction],
  );

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
      {running && step ? (
        <SpotlightOverlay
          step={step}
          stepIndex={stepIndex}
          stepCount={TUTORIAL_STEPS.length}
          hole={hole}
          onNext={() => {
            if (stepIndex >= TUTORIAL_STEPS.length - 1) {
              void finishTutorial();
              return;
            }
            advance();
          }}
          onSkip={() => {
            void finishTutorial();
          }}
        />
      ) : null}
    </TutorialContext.Provider>
  );
}
