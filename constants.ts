import { User, UserRole } from './types';

export const ADMIN_USER: User = {
  id: 'u-admin',
  name: 'Bonniface',
  email: 'admin@bonniface.com',
  role: UserRole.ADMIN,
  avatarUrl: '/assets/boni_avatar.jpg'
};

export const CLIENT_USER: User = {
  id: 'u-client-1',
  name: 'Sarah Johnson',
  email: 'sarah@acmecorp.com',
  role: UserRole.CLIENT,
  avatarUrl: 'https://picsum.photos/seed/sarah/200/200'
};

// Deprecated: Using Database
export const MOCK_PAYMENT_METHODS = [];
export const MOCK_PROJECTS = [];
export const MOCK_INVOICES = [];
export const ADMIN_CHATS = [];
export const CLIENT_CHATS = [];
export const REVENUE_DATA = [];