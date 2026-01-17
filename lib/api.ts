import { supabase } from './supabaseClient';
import { Project, Invoice, PaymentMethod, ProjectFile, ProjectPhase, ServiceType, ProjectStatus, ChatSession, Message } from '../types';

// Helper to map DB snake_case to App camelCase
const mapProject = (data: any): Project => ({
  id: data.id,
  title: data.title,
  clientName: data.client_name,
  serviceType: data.service_type as ServiceType,
  budget: data.budget,
  status: data.status as ProjectStatus,
  deadline: data.deadline,
  lastUpdated: new Date(data.last_updated).toLocaleDateString(),
  phases: data.phases ? data.phases.map(mapPhase) : []
});

const mapPhase = (data: any): ProjectPhase => ({
  id: data.id,
  title: data.title,
  description: data.description,
  status: data.status,
  files: data.files ? data.files.map(mapFile) : []
});

const mapFile = (data: any): ProjectFile => ({
  id: data.id,
  name: data.name,
  url: data.url,
  type: data.type,
  uploadedBy: data.uploaded_by,
  date: data.date
});

const mapInvoice = (data: any): Invoice => ({
  id: data.id,
  projectId: data.project_id,
  clientName: data.client_name,
  amount: data.amount,
  date: data.date,
  status: data.status
});

const mapPaymentMethod = (data: any): PaymentMethod => ({
  id: data.id,
  last4: data.last4,
  brand: data.brand,
  expiry: data.expiry,
  isDefault: data.is_default
});

// --- API FUNCTIONS ---

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

  // If not admin, filter by user. (RLS should handle this, but explicit filter is safe)
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
  let query = supabase.from('invoices').select('*');

  if (!isAdmin && clientName) {
    query = query.eq('client_name', clientName);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
  return data.map(mapInvoice);
};

export const updateInvoiceStatus = async (invoiceId: string, status: string) => {
  const { error } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', invoiceId);
  return !error;
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
  const { data, error } = await supabase
    .from('payment_methods')
    .insert([{
      id: `pm_${Date.now()}`,
      user_id: userId,
      last4: pm.last4,
      brand: pm.brand,
      expiry: pm.expiry,
      is_default: pm.isDefault
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating payment method:', error);
    return null;
  }
  return mapPaymentMethod(data);
};

export const uploadProjectFile = async (
  file: File, 
  phaseId: string, 
  userName: string
): Promise<ProjectFile | null> => {
  // 1. Upload to Storage
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('project-files')
    .upload(fileName, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return null;
  }

  // 2. Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from('project-files')
    .getPublicUrl(fileName);

  // 3. Insert into DB
  const extension = file.name.split('.').pop()?.toLowerCase();
  let type = 'doc';
  if (['jpg', 'png', 'jpeg'].includes(extension || '')) type = 'img';
  else if (extension === 'pdf') type = 'pdf';
  else if (extension === 'csv') type = 'csv';

  const newFileEntry = {
    id: `f-${Date.now()}`,
    phase_id: phaseId,
    name: file.name,
    url: publicUrl,
    type: type,
    uploaded_by: userName,
    date: new Date().toISOString().split('T')[0]
  };

  const { data: dbData, error: dbError } = await supabase
    .from('project_files')
    .insert([newFileEntry])
    .select()
    .single();

  if (dbError) {
    console.error('DB Insert error:', dbError);
    return null;
  }

  return mapFile(dbData);
};

// --- PROJECT MUTATIONS ---

export const createProject = async (
  title: string, 
  budget: number, 
  description: string, 
  serviceType: ServiceType, 
  userId: string,
  clientName: string
): Promise<Project | null> => {
  const projectId = `PRJ-${Date.now().toString().slice(-6)}`;
  
  // 1. Create Project
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
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // ~30 days default
      last_updated: new Date().toISOString()
    }])
    .select()
    .single();

  if (projectError) {
    console.error('Create Project Error:', projectError);
    return null;
  }

  // 2. Create Initial "Discovery" Phase automatically
  const phaseId = `ph-${Date.now()}`;
  await supabase
    .from('project_phases')
    .insert([{
      id: phaseId,
      project_id: projectId,
      title: 'Discovery & Requirements',
      description: description || 'Initial project scope and requirements gathering.',
      status: 'Pending'
    }]);

  // Return mapped project
  return {
    ...mapProject(projectData),
    phases: [{
      id: phaseId,
      title: 'Discovery & Requirements',
      description: description || 'Initial project scope and requirements gathering.',
      status: 'Pending',
      files: []
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
      status: phase.status
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

// --- CHAT FUNCTIONS ---

export const fetchUserChats = async (userId: string): Promise<ChatSession[]> => {
  // 1. Get Rooms I am a member of
  const { data: myRooms, error: roomError } = await supabase
    .from('room_members')
    .select('room_id')
    .eq('user_id', userId);

  if (roomError || !myRooms || myRooms.length === 0) return [];
  
  const roomIds = myRooms.map(r => r.room_id);

  // 2. Fetch Rooms details with Messages
  const { data: roomsData } = await supabase
    .from('chat_rooms')
    .select(`
      id,
      name,
      messages (id, user_id, content, created_at)
    `)
    .in('id', roomIds);
  
  if (!roomsData) return [];

  // 3. Fetch all members for these rooms (to identify participants)
  const { data: membersData } = await supabase
    .from('room_members')
    .select('room_id, user_id')
    .in('room_id', roomIds);

  // 4. Fetch profiles for these members
  const allUserIds = Array.from(new Set(membersData?.map(m => m.user_id) || []));
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', allUserIds);

  const profilesMap = new Map(profilesData?.map(p => [p.id, p]));

  // Assemble ChatSessions
  const sessions: ChatSession[] = roomsData.map((room: any) => {
     // Find the "other" participant
     const roomMemberIds = membersData?.filter(m => m.room_id === room.id).map(m => m.user_id) || [];
     const otherUserId = roomMemberIds.find(uid => uid !== userId) || userId; 
     const profile = profilesMap.get(otherUserId) as any;

     const messages: Message[] = (room.messages || []).map((m: any) => ({
        id: m.id.toString(),
        senderId: m.user_id,
        content: m.content,
        timestamp: new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        _fullDate: new Date(m.created_at), // Helper for sorting
        isRead: true
     })).sort((a: any, b: any) => a._fullDate.getTime() - b._fullDate.getTime());

     const lastMsg = messages[messages.length - 1];

     return {
        id: room.id,
        participantId: otherUserId,
        participantName: profile?.full_name || 'Unknown User',
        participantAvatar: profile?.avatar_url || 'https://picsum.photos/seed/unknown/200/200',
        lastMessage: lastMsg?.content || 'No messages yet',
        unreadCount: 0,
        timestamp: lastMsg?.timestamp || '',
        messages: messages
     };
  });

  // Sort sessions by last message time
  return sessions.sort((a, b) => {
      const dateA = a.messages.length > 0 ? (a.messages[a.messages.length - 1] as any)._fullDate : new Date(0);
      const dateB = b.messages.length > 0 ? (b.messages[b.messages.length - 1] as any)._fullDate : new Date(0);
      return dateB.getTime() - dateA.getTime();
  });
};

export const sendMessage = async (roomId: string, userId: string, content: string) => {
    const { error } = await supabase
        .from('messages')
        .insert([{ room_id: roomId, user_id: userId, content }]);
    
    if (error) throw error;
};