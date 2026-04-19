import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      user: { id: 1, name: "Shiv", email: "shiv@example.com", role: "user" }, // mock auth
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),

      liveCrowds: {}, // Station mapping: "Andheri" -> "HIGH"
      updateCrowd: (stationId, level) => set((state) => ({
        liveCrowds: { ...state.liveCrowds, [stationId]: level }
      })),

      booking: { lineId: "L3", from: "", to: "", passengers: 1, cls: "AC" },
      setBooking: (update) => set((state) => ({ booking: { ...state.booking, ...update } })),

      bookedTickets: [],
      activePasses: [],
      activeJourneyId: null,

      // Actions
      addBookedTickets: (tickets) => set((state) => ({ bookedTickets: [...state.bookedTickets, ...tickets] })),
      addPass: (pass) => set((state) => ({
        activePasses: [...state.activePasses, pass]
      })),
      setActiveJourneyId: (id) => set({ activeJourneyId: id }),
      clearTickets: () => set({ bookedTickets: [] }),

      feedbacks: [],
      addFeedback: (fb) => set((state) => ({ feedbacks: [...state.feedbacks, fb] })),

      complaints: [],
      addComplaint: (c) => set((state) => ({ complaints: [...state.complaints, c] })),
      updateComplaintStatus: (id, status) => set((state) => ({
        complaints: state.complaints.map(c => c.id === id ? { ...c, status } : c)
      })),
    }),
    {
      name: 'smart-rail-tickets', // localStorage key
      partialize: (state) => ({ 
        bookedTickets: state.bookedTickets,
        activePasses: state.activePasses,
        feedbacks: state.feedbacks,
        complaints: state.complaints
      }), // persist tickets, passes, feedbacks, and complaints
    }
  )
);

export default useStore;
