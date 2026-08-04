/**
 * @file main.jsx
 * @description Application entry point — the very first file the browser executes.
 *
 * Responsibilities:
 *   1. Import global styles (index.css includes Tailwind + shadcn theme variables).
 *   2. Create the React Query client with sensible defaults (5-min cache, no refetch on tab switch).
 *   3. Mount the <App /> component into the #root div in index.html.
 *   4. Wrap everything in QueryClientProvider so any component can use useQuery/useMutation.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

/* Global styles — must be imported before any component */
import "@/index.css";

/* Root application component */
import App from "@/App";

/* React Query — provides data-fetching hooks with built-in caching */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { ThemeProvider } from "@/context/ThemeContext";

/**
 * Configure the global React Query client.
 * - refetchOnWindowFocus: false → Don't re-fetch data every time the user switches tabs.
 * - retry: 1 → Only retry failed API calls once before showing an error.
 * - staleTime: 5 minutes → Treat cached data as fresh for 5 minutes.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

/* Mount the entire React application into the <div id="root"> in index.html */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <App />
          {/* DevTools panel (only visible in development builds) */}
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);

