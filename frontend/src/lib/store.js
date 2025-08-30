import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            portfolioId: null,
            setUser: (user) => set({ user }), // removed isLoggedIn
            logout: async () => {
                set({ user: null }) // removed isLoggedIn
            }
        }),
        {
            name: "auth-storage"
        }
    )
)