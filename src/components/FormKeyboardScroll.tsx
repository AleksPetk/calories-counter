import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '../theme/spacing';

type FormKeyboardScrollProps = {
  children: ReactNode;
  contentContainerStyle?: ViewStyle;
};

type FormScrollContextValue = {
  scrollToFocusedInput: (inputRef: RefObject<TextInput | null>) => void;
};

const FormScrollContext = createContext<FormScrollContextValue | null>(null);

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref != null) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

/** TextInput that scrolls into view when focused inside FormKeyboardScroll. */
export const FormTextInput = forwardRef<TextInput, TextInputProps>(
  function FormTextInput(props, ref) {
    const ctx = useContext(FormScrollContext);
    const localRef = useRef<TextInput | null>(null);

    return (
      <TextInput
        {...props}
        ref={(node) => {
          localRef.current = node;
          assignRef(ref, node);
        }}
        onFocus={(event) => {
          props.onFocus?.(event);
          ctx?.scrollToFocusedInput(localRef);
        }}
      />
    );
  },
);

/**
 * Reusable keyboard-aware form scroll.
 * Bottom inset = keyboard height + safe area; focused fields scroll into view
 * via measureInWindow (Fabric-safe — avoids numeric node handles).
 */
export function FormKeyboardScroll({
  children,
  contentContainerStyle,
}: FormKeyboardScrollProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const keyboardHeightRef = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      const height = event.endCoordinates.height;
      keyboardHeightRef.current = height;
      setKeyboardHeight(height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardHeightRef.current = 0;
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const bottomInset = useMemo(() => {
    if (keyboardHeight <= 0) {
      return spacing.xxl + insets.bottom;
    }
    return keyboardHeight + spacing.lg + insets.bottom;
  }, [keyboardHeight, insets.bottom]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    },
    [],
  );

  const scrollToFocusedInput = useCallback(
    (inputRef: RefObject<TextInput | null>) => {
      const delay = Platform.OS === 'ios' ? 100 : 160;
      setTimeout(() => {
        const input = inputRef.current;
        const scroll = scrollRef.current;
        if (!input || !scroll) {
          return;
        }

        input.measureInWindow((_ix, iy, _iw, ih) => {
          if (!scrollRef.current) {
            return;
          }
          const keyboardTop =
            Dimensions.get('window').height - keyboardHeightRef.current;
          const inputBottom = iy + ih;
          const padding = spacing.xl;
          if (inputBottom + padding <= keyboardTop) {
            return;
          }
          const overlap = inputBottom + padding - keyboardTop;
          scrollRef.current.scrollTo({
            y: Math.max(0, scrollOffsetRef.current + overlap),
            animated: true,
          });
        });
      }, delay);
    },
    [],
  );

  const contextValue = useMemo(
    () => ({ scrollToFocusedInput }),
    [scrollToFocusedInput],
  );

  return (
    <FormScrollContext.Provider value={contextValue}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            { paddingBottom: bottomInset, flexGrow: 1 },
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          <Pressable style={styles.flexGrow} onPress={Keyboard.dismiss}>
            {children}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </FormScrollContext.Provider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  flexGrow: {
    flexGrow: 1,
  },
});
