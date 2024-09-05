"use client";

// React Query requires a context provider for your entire web app
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// create a React Query Client object to take full advantage of Tanstack's automatically built-in caching mechanism, and all kinds of other things
export const queryClient = new QueryClient();

const QCProvider = ({ children }: { children: React.ReactNode }) => {
  // return React Query context provider that allows you to use React Query across your web app
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default QCProvider;
