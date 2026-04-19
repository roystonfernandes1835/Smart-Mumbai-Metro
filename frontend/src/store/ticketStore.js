import { create } from 'zustand';

export const useTicketStore = create((set) => ({
  tickets: [], // Will be populated from API
  setTickets: (tickets) => set({ tickets }),
  addTicket: (ticket) => set((state) => ({ tickets: [ticket, ...state.tickets] })),
}));
