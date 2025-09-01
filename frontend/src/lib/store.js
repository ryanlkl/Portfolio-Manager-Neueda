import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            portfolioId: null,
            setUser: (user) => set({ user, isLoggedIn: true }),
            logout: async () => {
                set({ user: null, isLoggedIn: false })
            }
        }),
        {
            name: "auth-storage"
        }
    )
)