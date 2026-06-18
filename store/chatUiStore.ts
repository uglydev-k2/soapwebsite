"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChatUiState {
  isOpen: boolean;
  hasUnread: boolean;
  nudgeShown: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  markRead: () => void;
  markUnread: () => void;
  setNudgeShown: () => void;
}

export const useChatUiStore = create<ChatUiState>()(
  persist(
    (set) => ({
      isOpen: false,
      hasUnread: false,
      nudgeShown: false,
      open: () => set({ isOpen: true, hasUnread: false }),
      close: () => set({ isOpen: false }),
      toggle: () =>
        set((state) => ({
          isOpen: !state.isOpen,
          hasUnread: state.isOpen ? state.hasUnread : false,
        })),
      markRead: () => set({ hasUnread: false }),
      markUnread: () => set((state) => (state.isOpen ? {} : { hasUnread: true })),
      setNudgeShown: () => set({ nudgeShown: true }),
    }),
    {
      name: "msvee-chat-ui",
      partialize: (state) => ({
        nudgeShown: state.nudgeShown,
      }),
    }
  )
);
