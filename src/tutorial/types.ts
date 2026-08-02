export const TUTORIAL_TEMP_ID_PREFIX = 'tutorial-temp-';

export function isTutorialTempId(id: string | null | undefined): boolean {
  return Boolean(id && id.startsWith(TUTORIAL_TEMP_ID_PREFIX));
}

export type TutorialTab = 'Home' | 'Library' | 'History' | 'Settings';

export type TutorialAdvanceOn = 'next' | 'action';

export type TutorialAction =
  | 'opened-add-item'
  | 'selected-logging-mode'
  | 'logged-library-item'
  | 'opened-settings-theme';

export type TutorialTargetId =
  | 'library.add'
  | 'library.mode'
  | 'library.pin'
  | 'home.pins'
  | 'home.calorie-card'
  | 'history.day'
  | 'settings.theme';

export type TutorialStep = {
  id: string;
  title: string;
  body: string;
  tab?: TutorialTab;
  targetId?: TutorialTargetId;
  advanceOn: TutorialAdvanceOn;
  /** When advanceOn is action, which notification advances. */
  action?: TutorialAction;
  primaryLabel?: string;
};

export type AnchorRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
