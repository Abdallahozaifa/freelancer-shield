import { create } from 'zustand';

interface ModalState {
  isOpen: boolean;
  type: string | null;
  data: unknown;
}

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  modal: ModalState;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (type: string, data?: unknown) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  openModal: (type, data = null) => set({ 
    modal: { isOpen: true, type, data } 
  }),
  closeModal: () => set({ 
    modal: { isOpen: false, type: null, data: null } 
  }),
}));

export default useUIStore;
