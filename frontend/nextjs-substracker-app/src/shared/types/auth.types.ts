
export type AuthUser = {
  id: string;
  email: string;
  avatarUrl?: string;
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

export type LoginFormData = {  //'...FormData' x descrivere i dati di un form prima di inviarli al backend 
  email: string;
  password: string;
};

export type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};
