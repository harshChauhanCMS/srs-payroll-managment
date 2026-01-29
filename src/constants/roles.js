export const ROLES = {
  SUPER_ADMIN: "super_admin",
  HR: "hr",
  ACCOUNTS: "accounts",
  MANAGER: "manager",
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.HR]: "HR",
  [ROLES.ACCOUNTS]: "Accounts",
  [ROLES.MANAGER]: "Manager",
};

export const ALL_ROLES = Object.values(ROLES);
