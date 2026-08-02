export type LibraryListItem = {
  id: string;
  name: string;
  calories: number;
  loggingMode: 'quick' | 'portion';
  pinned: boolean;
  image?: string | null;
};
