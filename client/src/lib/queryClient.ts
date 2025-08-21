import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// Helper functions for new consolidated endpoints
export const API_ENDPOINTS = {
  getDailyWord: () => '/api/game-api?action=daily-word',
  generateWord: () => '/api/game-api?action=generate-word',
  submitStats: () => '/api/game-api?action=submit-stats',
  getLeaderboard: (limit = 10) => `/api/game-api?action=leaderboard&limit=${limit}`,
  getTopPatterns: (date: string) => `/api/game-api?action=top-patterns&date=${date}`,
  createUser: () => '/api/users-api',
  getUser: (username: string) => `/api/users-api?username=${username}`,
  generateUsername: () => '/api/users-api?action=generate-username',
  getUserStats: (userId: number) => `/api/user-data?userId=${userId}&action=stats`,
  checkCompletion: (userId: number) => `/api/user-data?userId=${userId}&action=completion`,
};

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
