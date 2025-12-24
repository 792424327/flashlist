
export type ItemType = 'task' | 'header';

export interface FlashListItem {
  id: string;
  text: string;
  completed: boolean;
  level: number; // Indentation level: 0, 1, 2...
  type: ItemType;
  createdAt: number;
}

export interface ListState {
  items: FlashListItem[];
}
