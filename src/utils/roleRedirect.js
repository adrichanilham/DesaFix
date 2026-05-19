export const roleDashboardPaths = {
  admin: '/admin/dashboard',
  customer: '/customer/dashboard',
  tukang: '/tukang/dashboard',
};

export function getDashboardPath(role) {
  return roleDashboardPaths[role] || '/';
}
