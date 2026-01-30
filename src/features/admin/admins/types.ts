export interface Admin {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER";
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  profileImage?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  twoFactorEnabled: boolean;
  logs: AdminLog[];
}

export interface AdminLog {
  id: string;
  action: string;
  target: string;
  ipAddress: string;
  createdAt: string;
}

export interface AdminLogItem extends AdminLog {
  adminId: string;
  adminName: string;
  adminEmail: string;
  adminImage?: string;
}

export interface GetAdminLogsParams {
  page?: number;
  pageSize?: number;
  adminId?: string;
}

export interface AdminLogListResponse {
  data: AdminLogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminListItem {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER";
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  image?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminListResponse {
  data: AdminListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetAdminListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: string;
}
