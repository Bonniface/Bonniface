import { Project, ProjectStatus, ServiceType, User, UserRole, ChatSession, Invoice, Message, PaymentMethod } from './types';

export const ADMIN_USER: User = {
  id: 'u-admin',
  name: 'Bonniface',
  email: 'admin@bonniface.com',
  role: UserRole.ADMIN,
  avatarUrl: 'https://picsum.photos/seed/bonniface/200/200'
};

export const CLIENT_USER: User = {
  id: 'u-client-1',
  name: 'Sarah Johnson',
  email: 'sarah@acmecorp.com',
  role: UserRole.CLIENT,
  avatarUrl: 'https://picsum.photos/seed/sarah/200/200'
};

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm_1', last4: '4242', brand: 'VISA', expiry: '12/25', isDefault: true }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'PRJ-2024-001',
    title: 'Sales Prediction Model',
    clientName: 'Sarah Johnson',
    serviceType: ServiceType.DATA_SCIENCE,
    budget: 12500,
    status: ProjectStatus.PAID,
    deadline: '2024-10-24',
    lastUpdated: 'Oct 24, 2024',
    phases: [
      {
        id: 'ph-1',
        title: 'Data Collection & Cleaning',
        description: 'Gathering historical sales data and cleaning anomalies.',
        status: 'Completed',
        files: [
          { id: 'f1', name: 'Raw_Sales_Data_2023.csv', url: '#', type: 'csv', uploadedBy: 'Client', date: '2024-10-01' },
          { id: 'f2', name: 'Data_Audit_Report.pdf', url: '#', type: 'pdf', uploadedBy: 'Admin', date: '2024-10-05' }
        ]
      },
      {
        id: 'ph-2',
        title: 'Model Training',
        description: 'Training XGBoost and LSTM models on the dataset.',
        status: 'In Progress',
        files: [
          { id: 'f3', name: 'Preliminary_Results.pdf', url: '#', type: 'pdf', uploadedBy: 'Admin', date: '2024-10-20' }
        ]
      },
      {
        id: 'ph-3',
        title: 'Deployment & Dashboard',
        description: 'Deploying the model to cloud and building the React dashboard.',
        status: 'Pending',
        files: []
      }
    ]
  },
  {
    id: 'PRJ-9042',
    title: 'Deep Learning Neural Net',
    clientName: 'Jane Doe Inc.',
    serviceType: ServiceType.AI_INTEGRATION,
    budget: 4500,
    status: ProjectStatus.IN_PROGRESS,
    deadline: '2024-01-24',
    lastUpdated: '2 hours ago',
    phases: []
  },
  {
    id: 'PRJ-7721',
    title: 'Climate Data Analytics',
    clientName: 'Eco Nature Org',
    serviceType: ServiceType.DATA_SCIENCE,
    budget: 7200,
    status: ProjectStatus.PENDING,
    deadline: '2024-02-05',
    lastUpdated: '5 hours ago',
    phases: []
  },
  {
    id: 'PRJ-1029',
    title: 'Image Detection API',
    clientName: 'Secure Metrics',
    serviceType: ServiceType.CONSULTING,
    budget: 2800,
    status: ProjectStatus.COMPLETED,
    deadline: '2023-12-15',
    lastUpdated: 'Yesterday',
    phases: []
  },
  {
    id: 'PRJ-4432',
    title: 'AI Workflow Automation',
    clientName: 'Flow Logic',
    serviceType: ServiceType.AI_INTEGRATION,
    budget: 5000,
    status: ProjectStatus.DECLINED,
    deadline: '2024-02-12',
    lastUpdated: '2 days ago',
    phases: []
  }
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-2024-001', projectId: 'PRJ-2024-001', clientName: 'Sarah Johnson', amount: 12500, date: '2024-10-24', status: 'Paid' },
  { id: 'INV-2024-002', projectId: 'PRJ-9042', clientName: 'Jane Doe Inc.', amount: 2250, date: '2024-11-01', status: 'Pending' },
  { id: 'INV-2024-003', projectId: 'PRJ-7721', clientName: 'Eco Nature Org', amount: 3600, date: '2024-11-15', status: 'Overdue' },
  { id: 'INV-2024-004', projectId: 'PRJ-1029', clientName: 'Secure Metrics', amount: 2800, date: '2023-12-15', status: 'Paid' },
];

// Messages for the specific chat session
const SHARED_MESSAGES: Message[] = [
  {
    id: 'm1',
    senderId: 'u-admin',
    content: "Hi Sarah! I've just finished the initial data cleaning phase. We found some anomalies in the Q3 regional data, so I've normalized those according to our previous discussion.",
    timestamp: '10:30 AM',
    isRead: true
  },
  {
    id: 'm2',
    senderId: 'u-client-1',
    content: "That's great progress, Bonniface. Did you have a chance to look at the seasonal trends? I've attached the new market brief we talked about yesterday.",
    timestamp: '11:15 AM',
    isRead: true
  },
  {
    id: 'm3',
    senderId: 'u-client-1',
    content: "Q4_Market_Trends_v2.pdf",
    timestamp: '11:15 AM',
    attachments: [{ name: 'Q4_Market_Trends_v2.pdf', type: 'pdf', url: '#' }],
    isRead: true
  },
  {
    id: 'm4',
    senderId: 'u-client-1',
    content: "The CSV looks great, can we start the PCA on this dataset next?",
    timestamp: '12:45 PM',
    isRead: false
  }
];

// Admin sees list of clients
export const ADMIN_CHATS: ChatSession[] = [
  {
    id: 'chat-1',
    participantId: 'u-client-1',
    participantName: 'Sarah Johnson',
    participantAvatar: 'https://picsum.photos/seed/sarah/200/200',
    lastMessage: 'The CSV looks great, can we start the PCA on this dataset next?',
    unreadCount: 2,
    timestamp: '12:45 PM',
    messages: SHARED_MESSAGES
  },
  {
    id: 'chat-2',
    participantId: 'u-client-2',
    participantName: 'Michael Chen',
    participantAvatar: 'https://picsum.photos/seed/michael/200/200',
    lastMessage: 'Thanks for the update on the dashboard.',
    unreadCount: 0,
    timestamp: 'Yesterday',
    messages: [
        {
            id: 'm5',
            senderId: 'u-client-2',
            content: "Hey, is the dashboard ready?",
            timestamp: 'Yesterday',
            isRead: true
        }
    ]
  }
];

// Client sees only Admin/Support
export const CLIENT_CHATS: ChatSession[] = [
  {
    id: 'chat-1',
    participantId: 'u-admin',
    participantName: 'Bonniface (Support)',
    participantAvatar: 'https://picsum.photos/seed/bonniface/200/200',
    lastMessage: 'The CSV looks great, can we start the PCA on this dataset next?',
    unreadCount: 0,
    timestamp: '12:45 PM',
    messages: SHARED_MESSAGES
  }
];

export const REVENUE_DATA = [
  { name: 'Jan', revenue: 30000, projected: 45000 },
  { name: 'Feb', revenue: 35000, projected: 48000 },
  { name: 'Mar', revenue: 32000, projected: 50000 },
  { name: 'Apr', revenue: 45000, projected: 52000 },
  { name: 'May', revenue: 50000, projected: 55000 },
  { name: 'Jun', revenue: 58000, projected: 60000 },
  { name: 'Jul', revenue: 62000, projected: 65000 },
  { name: 'Aug', revenue: 65000, projected: 68000 },
  { name: 'Sep', revenue: 70000, projected: 72000 },
  { name: 'Oct', revenue: 68000, projected: 75000 },
  { name: 'Nov', revenue: 80000, projected: 78000 },
  { name: 'Dec', revenue: 85000, projected: 82000 },
];