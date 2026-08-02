export type LibraryListItem = {
  id: string;
  name: string;
  calories?: number;
  kind: 'food' | 'meal';
  pinned: boolean;
};
