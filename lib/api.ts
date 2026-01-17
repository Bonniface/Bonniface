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

export const markInvoiceAsPaid = async (invoiceId: string, projectId: string): Promise<boolean> => {
  // 1. Update Invoice Status
  const { error: invError } = await supabase
    .from('invoices')
    .update({ status: 'Paid' })
    .eq('id', invoiceId);
    
  if (invError) {
    console.error("Error updating invoice:", invError);
    return false;
  }
  
  // 2. Update Project Status (If currently Pending, move to In Progress)
  // We perform a conditional update.
  const { error: prjError } = await supabase
    .from('projects')
    .update({ status: ProjectStatus.IN_PROGRESS })
    .eq('id', projectId)
    .eq('status', ProjectStatus.PENDING);
    
  if (prjError) {
      console.warn("Project status update failed (might not be pending):", prjError);
  }
    
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

// --- HELPER FOR ADMIN CHAT ---
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
    // 1. Check if room exists for these two users
    
    // Get all rooms current user is in
    const { data: myMemberships } = await supabase
        .from('room_members')
        .select('room_id')
        .eq('user_id', userId);
    
    if (myMemberships && myMemberships.length > 0) {
        const myRoomIds = myMemberships.map(m => m.room_id);
        
        // Check if admin is in any of these rooms
        const { data: commonRoom } = await supabase
            .from('room_members')
            .select('room_id')
            .eq('user_id', adminId)
            .in('room_id', myRoomIds)
            .limit(1)
            .single();
            
        if (commonRoom) return commonRoom.room_id;
    }
    
    // 2. Create new room if not exists
    const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert([{ name: 'Support' }])
        .select()
        .single();
        
    if (roomError || !newRoom) return null;
    
    // 3. Add members
    await supabase.from('room_members').insert([
        { room_id: newRoom.id, user_id: userId },
        { room_id: newRoom.id, user_id: adminId }
    ]);
    
    return newRoom.id;
};

// --- PROJECT MUTATIONS ---

export const createProject = async (
  title: string, 
  budget: number, 
  description: string, 
  serviceType: ServiceType, 
  userId: string,
  clientName: string,
  initialFile?: File
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

  // 3. Upload File if present
  let uploadedFile = null;
  if (initialFile) {
     uploadedFile = await uploadProjectFile(initialFile, phaseId, clientName);
  }

  // 4. Create Invoice (20% Deposit)
  const depositAmount = budget * 0.2;
  const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
  await supabase.from('invoices').insert([{
     id: invoiceId,
     project_id: projectId,
     client_name: clientName,
     amount: depositAmount,
     date: new Date().toISOString().split('T')[0],
     status: 'Pending'
  }]);

  // 5. Ensure Chat & Notify Admin
  const adminId = await getAdminId();
  if (adminId) {
     const roomId = await ensureChatRoom(userId, adminId);
     if (roomId) {
        // Send automatic system message
        await sendMessage(roomId, userId, `I've just submitted a new project: "${title}". Looking forward to discussing the requirements.`);
     }
  }

  // Return mapped project
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

// --- USER & SETTINGS ---

export const updateUserProfile = async (userId: string, updates: { full_name?: string }) => {
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
    
    return !error;
};

// --- CHAT FUNCTIONS ---

export const fetchUserChats = async (userId: string): Promise<ChatSession[]> => {
  // Ensure basic support chat exists for user if they are a client
  // We do this check here lazily
  const adminId = await getAdminId();
  if (adminId && userId !== adminId) {
     await ensureChatRoom(userId, adminId);
  }

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
        participantName: profile?.full_name || 'Support Agent',
        participantAvatar: profile?.avatar_url || 'https://picsum.photos/seed/admin/200/200',
        lastMessage: lastMsg?.content || 'Start a conversation...',
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