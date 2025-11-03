'use client';

import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useState } from 'react';
import superjson from 'superjson';
import { AppRouter } from '@repo/trpc/routers';

import { createQueryClient } from './query-client';
// import { getHeaders } from 'better-auth/react';

export const api: ReturnType<typeof createTRPCReact<AppRouter>> = createTRPCReact<AppRouter>();

let clientQueryClientSingleton: QueryClient;
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= createQueryClient());
}
// TODO:- Update this to use the correct URL from the environment variables
function getUrl() {
  const base = (() => {
    // if (typeof window !== 'undefined') return '';
    // // TODO:- Get the correct URL from the environment variables
    // // if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

    return 'http://localhost:3000';
  })();
  return `${base}/trpc`;
}

export function TRPCProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: getUrl(),
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include',
            });
          },
          headers() {
            return {
              "x-trpc-source": "admin-app",
            }
          }
        }),

      ],
    }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children as any}
      </api.Provider>
    </QueryClientProvider>
  );
}