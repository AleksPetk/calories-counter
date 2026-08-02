import {
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTutorialOptional } from './TutorialProvider';
import type { AnchorRect, TutorialTargetId } from './types';

type TutorialAnchorProps = ViewProps & {
  id: TutorialTargetId;
  children: ReactNode;
};

/** Registers a measurable layout target for the spotlight tutorial. */
export function TutorialAnchor({
  id,
  children,
  style,
  ...rest
}: TutorialAnchorProps) {
  const tutorial = useTutorialOptional();
  const viewRef = useRef<View>(null);

  const measure = useCallback((): Promise<AnchorRect | null> => {
    return new Promise((resolve) => {
      const node = viewRef.current;
      if (!node) {
        resolve(null);
        return;
      }
      node.measureInWindow((x, y, width, height) => {
        if (width <= 0 || height <= 0) {
          resolve(null);
          return;
        }
        resolve({ x, y, width, height });
      });
    });
  }, []);

  useEffect(() => {
    if (!tutorial) {
      return;
    }
    tutorial.registerTarget(id, measure);
    return () => {
      tutorial.unregisterTarget(id, measure);
    };
  }, [tutorial, id, measure]);

  return (
    <View
      ref={viewRef}
      collapsable={false}
      style={[styles.wrap, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
});
