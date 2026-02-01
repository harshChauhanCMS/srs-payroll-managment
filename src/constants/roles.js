export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  HR: "hr",
  EMPLOYEE: "employee",
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Admin",
  [ROLES.HR]: "HR",
  [ROLES.EMPLOYEE]: "Employee",
};

export const ALL_ROLES = Object.values(ROLES);
