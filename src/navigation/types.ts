export type LibraryStackParamList = {
  LibraryHome: undefined;
  LibraryItemEditor: { itemId?: string } | undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  TodaysLog: undefined;
  LogEntryEditor: { entryId: string };
};

export type RootTabParamList = {
  Home: undefined;
  Library: import('@react-navigation/native').NavigatorScreenParams<LibraryStackParamList>;
  History: undefined;
  Settings: undefined;
};
