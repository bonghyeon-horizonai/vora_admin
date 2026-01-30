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
