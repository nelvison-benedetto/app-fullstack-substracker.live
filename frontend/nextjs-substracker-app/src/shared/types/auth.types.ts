export type AuthUser = {
  id: string;
  email: string;
};

export type LoginResponseData = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  user?: AuthUser;
};

export type RegisterResponseData = {
  id: string;
  email: string;
};

export type LoginFormData = {
  email: string;
  password: string;
};

export type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};
