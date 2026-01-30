import { MOCK_ADMINS } from "./mock-data";
import { AdminListResponse, GetAdminListParams } from "./types";

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
        admin.email.toLowerCase().includes(searchLower)
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
