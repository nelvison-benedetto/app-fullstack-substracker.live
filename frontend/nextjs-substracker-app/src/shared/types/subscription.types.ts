export type Subscription = {
  id: string;
  name: string;
  amount: number;
  billingCycle: string;
  startDate: string;
  endDate?: string | null;
  category?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SubHistoryItem = {
  id: string;
  action: string;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
};

export type SubscriptionDetail = Subscription & {
  history: SubHistoryItem[];
};

export type CreateSubscriptionData = {
  name: string;
  amount: number;
  billingCycle: string;
  startDate: string;
  endDate?: string | null;
  category?: string | null;
};

export type UpdateSubscriptionData = {
  name: string;
  amount: number;
  billingCycle: string;
  endDate?: string | null;
  category?: string | null;
};
