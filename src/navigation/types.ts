export type LibraryStackParamList = {
  LibraryHome: undefined;
  LibraryItemEditor: { itemId?: string } | undefined;
  ReferenceCopy: { referenceId: string };
};

export type HomeStackParamList = {
  HomeMain: undefined;
  TodaysLog: undefined;
  LogEntryEditor: { entryId: string };
};

export type HistoryStackParamList = {
  HistoryHome: undefined;
  LogEntryEditor: { entryId: string };
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  Themes: undefined;
  AppInformation: undefined;
  DailyGoalEditor: undefined;
  ResetTimeEditor: undefined;
  RetentionPicker: undefined;
  CaloriePlanner: undefined;
  PlannerQuestionnaire: undefined;
};

export type RootTabParamList = {
  Home: import('@react-navigation/native').NavigatorScreenParams<HomeStackParamList>;
  Library: import('@react-navigation/native').NavigatorScreenParams<LibraryStackParamList>;
  History: import('@react-navigation/native').NavigatorScreenParams<HistoryStackParamList>;
  Settings: import('@react-navigation/native').NavigatorScreenParams<SettingsStackParamList>;
};

export type RootStackParamList = {
  Main:
    | import('@react-navigation/native').NavigatorScreenParams<RootTabParamList>
    | undefined;
  Paywall: undefined;
};
