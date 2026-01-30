import { MOCK_ADMINS } from "./mock-data";
import {
  Admin,
  AdminListResponse,
  AdminLogItem,
  AdminLogListResponse,
  GetAdminListParams,
  GetAdminLogsParams,
} from "./types";

export async function getAllAdminLogs({
  page = 1,
  pageSize = 10,
  adminId,
}: GetAdminLogsParams): Promise<AdminLogListResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  let allLogs: AdminLogItem[] = [];

  // Flatten logs from all admins
  MOCK_ADMINS.forEach((admin) => {
    if (admin.logs) {
      admin.logs.forEach((log) => {
        allLogs.push({
          ...log,
          adminId: admin.id,
          adminName: admin.name,
          adminEmail: admin.email,
          adminImage: admin.profileImage,
        });
      });
    }
  });

  // Filter by adminId if provided
  if (adminId) {
    allLogs = allLogs.filter((log) => log.adminId === adminId);
  }

  // Sort by createdAt desc
  allLogs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Pagination
  const total = allLogs.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedLogs = allLogs.slice(start, end);

  return {
    data: paginatedLogs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getAdminList({
  page = 1,
  pageSize = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
  search,
  status,
}: GetAdminListParams): Promise<AdminListResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filteredAdmins = [...MOCK_ADMINS];

  if (search) {
    const searchLower = search.toLowerCase();
    filteredAdmins = filteredAdmins.filter(
      (admin) =>
        admin.name.toLowerCase().includes(searchLower) ||
        admin.email.toLowerCase().includes(searchLower),
    );
  }

  if (status) {
    filteredAdmins = filteredAdmins.filter((admin) => admin.status === status);
  }

  // Sorting
  filteredAdmins.sort((a, b) => {
    const aValue = a[sortBy as keyof typeof a];
    const bValue = b[sortBy as keyof typeof b];

    if (!aValue || !bValue) return 0;

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const total = filteredAdmins.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedAdmins = filteredAdmins.slice(start, end);

  return {
    data: paginatedAdmins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      image: admin.profileImage,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getAdminDetail(id: string): Promise<Admin | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const admin = MOCK_ADMINS.find((a) => a.id === id);

  if (!admin) return null;

  return admin;
}
