import { supabase } from './supabaseClient';
import { Project, Invoice, PaymentMethod, ProjectFile, ProjectPhase, ServiceType, ProjectStatus, ChatSession, Message, User, UserRole, Booking } from '../types';
import boniAvatar from '../images/boni_avatar.jpg';

// Helper to map DB snake_case to App camelCase
const mapProject = (data: any): Project => ({
  id: data.id,
  title: data.title,
  clientName: data.client_name,
  serviceType: data.service_type as ServiceType,
  budget: data.budget,
  status: data.status as ProjectStatus,
  deadline: data.deadline,
  lastUpdated: new Date(data.updated_at || data.created_at).toLocaleDateString(),
  phases: data.phases ? data.phases.map(mapPhase) : []
});

const mapPhase = (data: any): ProjectPhase => ({
  id: data.id,
  title: data.title,
  description: data.description,
  status: data.status,
  files: data.files ? data.files.map(mapFile) : []
});

const mapFile = (data: any): ProjectFile => {
  let type: any = 'doc';
  if (data.file_type === 'image') type = 'img';
  else if (data.file_type === 'pdf') type = 'pdf';
  else if (data.file_type === 'spreadsheet') type = 'csv';

  return {
    id: data.id,
    name: data.name,
    url: data.url,
    type: type,
    uploadedBy: 'User',
    date: new Date(data.created_at).toLocaleDateString()
  };
};

const mapInvoice = (data: any): Invoice => ({
  id: data.id,
  projectId: data.project_id,
  clientName: data.client?.full_name || 'Client',
  amount: data.amount,
  date: data.issue_date,
  status: data.status
});

const mapBooking = (data: any): Booking => ({
  id: data.id,
  userId: data.user_id,
  clientName: data.client_name,
  date: data.booking_date,
  time: data.booking_time,
  status: data.status,
  serviceType: data.service_type,
  createdAt: data.created_at
});

const mapPaymentMethod = (data: any): PaymentMethod => ({
  id: data.id,
  last4: data.last4,
  brand: data.brand,
  expiry: `${String(data.expiry_month).padStart(2, '0')}/${String(data.expiry_year).slice(-2)}`,
  isDefault: data.is_default
});

// --- API FUNCTIONS ---

export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  let avatarUrl = data.avatar_url;
  if (!avatarUrl) {
    if (data.role === 'ADMIN') avatarUrl = boniAvatar;
    else avatarUrl = `https://picsum.photos/seed/${userId}/200/200`;
  }

  return {
    id: data.id,
    name: data.full_name || data.email?.split('@')[0] || 'User',
    email: data.email || '',
    role: (data.role as UserRole) || UserRole.CLIENT,
    avatarUrl
  };
};

export const fetchProjects = async (userId?: string, isAdmin?: boolean): Promise<Project[]> => {
  let query = supabase
    .from('projects')
    .select(`
      *,
      phases:project_phases (
        *,
        files:project_files (*)
      )
    `)
    .order('created_at', { ascending: false });

  if (!isAdmin && userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return data.map(mapProject);
};

export const fetchInvoices = async (clientName?: string, isAdmin?: boolean): Promise<Invoice[]> => {
  let query = supabase.from('invoices').select('*, client:profiles(full_name)');
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
  return data.map(mapInvoice);
};

export const fetchBookings = async (userId?: string, isAdmin?: boolean): Promise<Booking[]> => {
  let query = supabase.from('bookings').select('*').order('booking_date', { ascending: true });

  if (!isAdmin && userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
  return data.map(mapBooking);
};

export const createBooking = async (userId: string, name: string, date: string, time: string, service: string = 'Consultation'): Promise<Booking | null> => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([{
      user_id: userId,
      client_name: name,
      booking_date: date,
      booking_time: time,
      service_type: service,
      status: 'Confirmed'
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating booking:", error);
    return null;
  }
  return mapBooking(data);
};

export const cancelBooking = async (bookingId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'Cancelled' })
    .eq('id', bookingId);

  if (error) {
    console.error("Error cancelling booking:", error);
    return false;
  }
  return true;
};

export const rescheduleBooking = async (bookingId: string, newDate: string, newTime: string): Promise<boolean> => {
  const { error } = await supabase
    .from('bookings')
    .update({ 
      booking_date: newDate, 
      booking_time: newTime, 
      status: 'Confirmed' 
    })
    .eq('id', bookingId);
    
  if (error) {
    console.error("Error rescheduling booking:", error);
    return false;
  }
  return true;
};

export const markInvoiceAsPaid = async (invoiceId: string, projectId: string): Promise<boolean> => {
  const { error: invError } = await supabase
    .from('invoices')
    .update({ status: 'Paid' })
    .eq('id', invoiceId);

  if (invError) {
    console.error("Error updating invoice:", invError);
    return false;
  }

  const { error: prjError } = await supabase
    .from('projects')
    .update({ status: ProjectStatus.IN_PROGRESS })
    .eq('id', projectId)
    .eq('status', ProjectStatus.PENDING);

  return true;
};

export const fetchPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }
  return data.map(mapPaymentMethod);
};

export const createPaymentMethod = async (pm: Omit<PaymentMethod, 'id'>, userId: string): Promise<PaymentMethod | null> => {
  const [monthStr, yearStr] = pm.expiry.split('/');
  const expiry_month = parseInt(monthStr);
  const expiry_year = 2000 + parseInt(yearStr);

  const { data, error } = await supabase
    .from('payment_methods')
    .insert([{
      user_id: userId,
      last4: pm.last4,
      brand: pm.brand,
      expiry_month,
      expiry_year,
      is_default: pm.isDefault
    }])
    .select()
    .single();

  if (error) return null;
  return mapPaymentMethod(data);
};

export const uploadProjectFile = async (
  file: File,
  phaseId: string,
  userName: string
): Promise<ProjectFile | null> => {
  const { data: phaseData } = await supabase.from('project_phases').select('project_id').eq('id', phaseId).single();
  const projectId = phaseData?.project_id || 'unknown';

  const fileName = `${projectId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  const { error: uploadError } = await supabase.storage
    .from('project-files')
    .upload(fileName, file);

  if (uploadError) return null;

  const { data: { publicUrl } } = supabase.storage
    .from('project-files')
    .getPublicUrl(fileName);

  const extension = file.name.split('.').pop()?.toLowerCase();
  let fileType = 'document';
  if (['jpg', 'png', 'jpeg'].includes(extension || '')) fileType = 'image';
  else if (extension === 'pdf') fileType = 'pdf';
  else if (extension === 'csv') fileType = 'spreadsheet';

  const { data: dbData, error: dbError } = await supabase
    .from('project_files')
    .insert([{
      project_id: projectId,
      phase_id: phaseId,
      name: file.name,
      url: publicUrl,
      file_type: fileType,
      file_size: file.size,
      uploaded_by: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();

  if (dbError) return null;

  return mapFile(dbData);
};

const getAdminId = async (): Promise<string | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'ADMIN')
    .limit(1)
    .single();

  if (error || !data) return null;
  return data.id;
};

const ensureChatRoom = async (userId: string, adminId: string): Promise<string | null> => {
  const { data: myMemberships } = await supabase
    .from('room_members')
    .select('room_id')
    .eq('user_id', userId);

  if (myMemberships && myMemberships.length > 0) {
    const myRoomIds = myMemberships.map(m => m.room_id);
    const { data: commonRoom } = await supabase
      .from('room_members')
      .select('room_id')
      .eq('user_id', adminId)
      .in('room_id', myRoomIds)
      .limit(1)
      .single();
    if (commonRoom) return commonRoom.room_id;
  }

  const { data: newRoom, error: roomError } = await supabase
    .from('chat_rooms')
    .insert([{ name: 'Support', type: 'direct' }])
    .select()
    .single();

  if (roomError || !newRoom) return null;

  await supabase.from('room_members').insert([
    { room_id: newRoom.id, user_id: userId },
    { room_id: newRoom.id, user_id: adminId }
  ]);

  return newRoom.id;
};

export const startSupportChat = async (userId: string): Promise<string | null> => {
  const adminId = await getAdminId();
  if (!adminId) return null;
  if (userId === adminId) return null;
  return ensureChatRoom(userId, adminId);
};

export const createProject = async (
  title: string,
  budget: number,
  description: string,
  serviceType: ServiceType,
  userId: string,
  clientName: string,
  initialFile?: File
): Promise<Project | null> => {
  const projectId = `PRJ-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .insert([{
      id: projectId,
      user_id: userId,
      title,
      client_name: clientName,
      service_type: serviceType,
      budget,
      status: ProjectStatus.PENDING,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }])
    .select()
    .single();

  if (projectError) return null;

  const phaseId = `ph-${Date.now()}`;
  await supabase
    .from('project_phases')
    .insert([{
      id: phaseId,
      project_id: projectId,
      title: 'Discovery & Requirements',
      description: description || 'Initial project scope and requirements gathering.',
      status: 'Pending',
      order_index: 0
    }]);

  let uploadedFile = null;
  if (initialFile) {
    uploadedFile = await uploadProjectFile(initialFile, phaseId, clientName);
  }

  const depositAmount = budget * 0.2;
  const invoiceId = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
  await supabase.from('invoices').insert([{
    id: invoiceId,
    project_id: projectId,
    client_id: userId,
    amount: depositAmount,
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Pending'
  }]);

  const adminId = await getAdminId();
  if (adminId && userId !== adminId) {
    const roomId = await ensureChatRoom(userId, adminId);
    if (roomId) {
      await sendMessage(roomId, userId, `I've just submitted a new project: "${title}". Looking forward to discussing the requirements.`);
    }
  }

  return {
    ...mapProject(projectData),
    phases: [{
      id: phaseId,
      title: 'Discovery & Requirements',
      description: description || 'Initial project scope and requirements gathering.',
      status: 'Pending',
      files: uploadedFile ? [uploadedFile] : []
    }]
  };
};

export const updateProjectPhase = async (phaseId: string, updates: Partial<ProjectPhase>) => {
  const dbUpdates: any = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.status !== undefined) dbUpdates.status = updates.status;

  const { error } = await supabase
    .from('project_phases')
    .update(dbUpdates)
    .eq('id', phaseId);

  return !error;
};

export const createProjectPhase = async (phase: ProjectPhase, projectId: string) => {
  const { error } = await supabase
    .from('project_phases')
    .insert([{
      id: phase.id,
      project_id: projectId,
      title: phase.title,
      description: phase.description,
      status: phase.status,
      order_index: 0
    }]);
  return !error;
};

export const deleteProjectPhase = async (phaseId: string) => {
  const { error } = await supabase
    .from('project_phases')
    .delete()
    .eq('id', phaseId);
  return !error;
};

export const updateUserProfile = async (userId: string, updates: { full_name?: string; role?: string }) => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  return !error;
};

// --- CHAT FUNCTIONS ---

export const uploadChatAttachment = async (file: File, roomId: string): Promise<string | null> => {
  const fileName = `chat/${roomId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  const { error: uploadError } = await supabase.storage
    .from('project-files')
    .upload(fileName, file);

  if (uploadError) {
    console.error("Chat upload failed", uploadError);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('project-files')
    .getPublicUrl(fileName);

  return publicUrl;
};

export const markRoomAsRead = async (roomId: string, userId: string) => {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('room_id', roomId)
    .neq('user_id', userId)
    .eq('is_read', false);

  if (error) console.error("Error marking read:", error);
};

export const fetchUserChats = async (userId: string): Promise<ChatSession[]> => {
  const { data: myRooms } = await supabase
    .from('room_members')
    .select('room_id')
    .eq('user_id', userId);

  if (!myRooms || myRooms.length === 0) return [];
  const roomIds = myRooms.map(r => r.room_id);

  const { data: roomsData } = await supabase
    .from('chat_rooms')
    .select(`
      id,
      name,
      messages (id, user_id, content, created_at, is_read, file_url, message_type)
    `)
    .in('id', roomIds)
    .order('created_at', { ascending: true, foreignTable: 'messages' });

  if (!roomsData) return [];

  const { data: membersData } = await supabase
    .from('room_members')
    .select('room_id, user_id')
    .in('room_id', roomIds);

  const allUserIds = Array.from(new Set(membersData?.map(m => m.user_id) || []));
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', allUserIds);

  const profilesMap = new Map(profilesData?.map(p => [p.id, p]));

  const sessions: ChatSession[] = roomsData.map((room: any) => {
    const roomMemberIds = membersData?.filter(m => m.room_id === room.id).map(m => m.user_id) || [];
    const otherUserId = roomMemberIds.find(uid => uid !== userId) || userId;
    const profile = profilesMap.get(otherUserId) as any;

    const sortedMessages = (room.messages || []).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const messages: Message[] = sortedMessages.map((m: any) => ({
      id: m.id.toString(),
      senderId: m.user_id,
      content: m.content,
      timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: m.created_at,
      _fullDate: new Date(m.created_at),
      isRead: m.is_read,
      attachments: m.file_url ? [{
        name: 'Attachment',
        type: m.message_type === 'image' ? 'img' : 'pdf',
        url: m.file_url
      }] : undefined
    }));

    const lastMsg = messages[messages.length - 1];
    const unreadCount = sortedMessages.filter((m: any) => m.user_id !== userId && !m.is_read).length;

    return {
      id: room.id,
      participantId: otherUserId,
      participantName: profile?.full_name || 'Support Agent',
      participantAvatar: profile?.avatar_url || 'https://picsum.photos/seed/admin/200/200',
      lastMessage: lastMsg?.content || (lastMsg?.attachments ? 'Sent a file' : 'Start a conversation...'),
      unreadCount: unreadCount,
      timestamp: lastMsg?.timestamp || '',
      lastMessageDate: lastMsg?.createdAt,
      messages: messages
    };
  });

  return sessions.sort((a, b) => {
    const dateA = a.messages.length > 0 ? (a.messages[a.messages.length - 1] as any)._fullDate : new Date(0);
    const dateB = b.messages.length > 0 ? (b.messages[b.messages.length - 1] as any)._fullDate : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });
};

export const sendMessage = async (roomId: string, userId: string, content: string, file?: File) => {
  let fileUrl = null;
  let messageType = 'text';

  if (file) {
    fileUrl = await uploadChatAttachment(file, roomId);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
      messageType = 'image';
    } else {
      messageType = 'file';
    }
  }

  const { error } = await supabase
    .from('messages')
    .insert([{
      room_id: roomId,
      user_id: userId,
      content: content || (file ? 'Sent a file' : ''),
      message_type: messageType,
      file_url: fileUrl,
      is_read: false
    }]);

  if (error) throw error;
};

export const generateSampleData = async (userId: string, userName: string) => {
  const existing = await fetchProjects(userId);
  if (existing.length > 0) return true;

  const p1 = await createProject(
    'AI Sentiment Analysis',
    15000,
    "Analyze customer feedback using NLP.",
    ServiceType.AI_INTEGRATION,
    userId,
    userName
  );
  if (p1) {
    await supabase.from('projects').update({ status: ProjectStatus.IN_PROGRESS }).eq('id', p1.id);

    const phase1 = p1.phases?.[0];
    if (phase1) {
      await updateProjectPhase(phase1.id, { status: 'Completed', title: 'Data Collection' });
    }

    await createProjectPhase({
      id: `ph-${Date.now()}-2`,
      title: 'Model Training',
      description: 'Training BERT model on labeled dataset.',
      status: 'In Progress',
      files: []
    }, p1.id);

    const { data: inv } = await supabase.from('invoices').select('id').eq('project_id', p1.id).single();
    if (inv) await markInvoiceAsPaid(inv.id, p1.id);
  }

  await createProject(
    'E-commerce Recommendation Engine',
    25000,
    "Personalized product suggestions model.",
    ServiceType.DATA_SCIENCE,
    userId,
    userName
  );

  return true;
};