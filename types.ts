export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT'
}

export enum ProjectStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  DECLINED = 'Declined',
  PAID = 'Paid'
}

export enum ServiceType {
  AI_INTEGRATION = 'AI Integration',
  DATA_SCIENCE = 'Data Science',
  WEB_DEV = 'Web Development',
  CONSULTING = 'Consulting'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'img' | 'doc' | 'csv' | 'zip';
  uploadedBy: string;
  date: string;
}

export interface ProjectPhase {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  files: ProjectFile[];
  dependencies?: string[];
}

export interface Project {
  id: string;
  title: string;
  clientName: string;
  serviceType: ServiceType;
  budget: number;
  status: ProjectStatus;
  deadline: string;
  lastUpdated: string;
  phases?: ProjectPhase[];
}

export interface Invoice {
  id: string;
  projectId: string;
  clientName: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface Booking {
  id: string;
  userId: string;
  clientName: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  serviceType: string;
  createdAt?: string;
}

export interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiry: string;
  isDefault: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  createdAt?: string;
  attachments?: { name: string; type: 'pdf' | 'csv' | 'img'; url: string }[];
  isRead: boolean;
}

export interface ChatSession {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  unreadCount: number;
  timestamp: string;
  lastMessageDate?: string;
  messages: Message[];
}

export type ViewState = 'OVERVIEW' | 'PROJECTS' | 'PROJECT_DETAILS' | 'MESSAGES' | 'NEW_PROJECT' | 'SETTINGS' | 'INVOICES' | 'BILLING' | 'ADD_PAYMENT_METHOD' | 'BOOKINGS';