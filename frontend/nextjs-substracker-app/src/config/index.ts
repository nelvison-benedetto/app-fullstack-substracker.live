export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export const API_ENDPOINTS = {
  auth: {
    register: `${API_BASE_URL}/api/v1/users/register`,
    login: `${API_BASE_URL}/api/v1/auth/login`,
    logout: `${API_BASE_URL}/api/v1/auth/logout`,
    refresh: `${API_BASE_URL}/api/v1/auth/refresh`,
  },
  users: {
    me: `${API_BASE_URL}/api/v1/users/me`,
  },
  subscriptions: {
    list: `${API_BASE_URL}/api/v1/subscriptions`,
    detail: (id: string) => `${API_BASE_URL}/api/v1/subscriptions/${id}`,
    create: `${API_BASE_URL}/api/v1/subscriptions`,
    update: (id: string) => `${API_BASE_URL}/api/v1/subscriptions/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/v1/subscriptions/${id}`,
  },
};

export const COOKIE_NAMES = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  userInfo: "user_info",
} as const;

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  profile: "/profile",
} as const;
