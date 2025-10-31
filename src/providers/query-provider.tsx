'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Thời gian cache data (5 phút)
            staleTime: 5 * 60 * 1000,
            // Thời gian giữ data trong cache (10 phút)
            gcTime: 10 * 60 * 1000,
            // Retry khi fetch thất bại
            retry: 1,
            // Không refetch khi window focus
            refetchOnWindowFocus: false,
            // Không refetch khi reconnect
            refetchOnReconnect: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
