import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));

// Notes store helpers (lightweight note model used across session views)
export interface Note {
  id: string;
  content: string;
  tags: string[];
  timestamp_ref?: number | null;
  is_ai_generated?: boolean;
}

interface NotesState {
  notes: Note[];
  addNote: (note: Omit<Note, 'id'>) => void;
  updateNote: (id: string, fields: Partial<Note>) => void;
  deleteNote: (id: string) => void;
}

// create a separate store for notes to keep separation of concerns
export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  addNote: (note) =>
    set((state) => ({
      notes: [
        ...state.notes,
        {
          id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          content: note.content,
          tags: note.tags ?? [],
          timestamp_ref: note.timestamp_ref ?? null,
          is_ai_generated: note.is_ai_generated ?? false,
        },
      ],
    })),
  updateNote: (id, fields) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...fields } : n)),
    })),
  deleteNote: (id) =>
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
}));
