import { AdminRoleEnum } from './constants';

export const PERMISSIONS = {
  MANAGE_CLIENT_STATUS: 'manage_client_status', 
  VIEW_ALL_CLIENTS: 'view_all_clients',
  VIEW_QUOTER: 'view_quoter', // Nuevo permiso para el cotizador
};

const ROLES_CONFIG = {
  [AdminRoleEnum.SuperAdmin]: [PERMISSIONS.MANAGE_CLIENT_STATUS, PERMISSIONS.VIEW_ALL_CLIENTS, PERMISSIONS.VIEW_QUOTER],
  [AdminRoleEnum.Admin]:      [PERMISSIONS.MANAGE_CLIENT_STATUS, PERMISSIONS.VIEW_ALL_CLIENTS, PERMISSIONS.VIEW_QUOTER],
  [AdminRoleEnum.Developer]:  [PERMISSIONS.MANAGE_CLIENT_STATUS, PERMISSIONS.VIEW_ALL_CLIENTS, PERMISSIONS.VIEW_QUOTER],
  [AdminRoleEnum.Support]:    [PERMISSIONS.MANAGE_CLIENT_STATUS, PERMISSIONS.VIEW_ALL_CLIENTS, PERMISSIONS.VIEW_QUOTER],
  [AdminRoleEnum.Seller]:     [PERMISSIONS.VIEW_QUOTER], 
  [AdminRoleEnum.Collection]: [PERMISSIONS.MANAGE_CLIENT_STATUS, PERMISSIONS.VIEW_ALL_CLIENTS],
  [AdminRoleEnum.AuxCollection]: [PERMISSIONS.MANAGE_CLIENT_STATUS, PERMISSIONS.VIEW_ALL_CLIENTS],
};

export const hasPermission = (roleId, permission) => {
  if (!roleId) return false;
  const userPermissions = ROLES_CONFIG[roleId] || [];
  return userPermissions.includes(permission);
};