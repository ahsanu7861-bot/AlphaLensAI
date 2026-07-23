import { create } from "zustand";

type CommandState = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

export const useCommandStore = create<CommandState>((set) => ({
  open: false,

  setOpen: (value) =>
    set({
      open: value,
    }),
}));