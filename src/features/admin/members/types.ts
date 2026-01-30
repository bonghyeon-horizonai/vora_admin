export type MemberStatus = "ACTIVE" | "INACTIVE" | "BANNED";

export interface Member {
  id: string;
  name: string;
  email: string;
  image?: string;
  provider: string;
  status: MemberStatus;
  createdAt: string;
  lastLoginAt?: string;
}

export type MemberListItem = Member;

export interface MemberAccount {
  id: string;
  providerId: string;
  accountId: string;
  createdAt: string | null;
}

export interface MemberSession {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string | null;
}

export interface MemberPurchase {
  id: string;
  productName: string;
  status: string;
  amount: number | null;
  currency: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
}

export interface MemberDetail extends Member {
  languageCode: string;
  onboardingStatus: string | null;
  accounts: MemberAccount[];
  sessions: MemberSession[];
  purchases: MemberPurchase[];
}
