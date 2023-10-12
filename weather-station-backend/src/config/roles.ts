const allRoles = {
  user: [],
  admin: ['getUsers', 'manageUsers', 'getStations', 'manageStations', 'getReports', 'manageReports'],
};

export const roles: string[] = Object.keys(allRoles);
export const roleRights: Map<string, string[]> = new Map(Object.entries(allRoles));
