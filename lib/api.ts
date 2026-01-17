import { supabase } from './supabaseClient';
import { Project, Invoice, PaymentMethod, ProjectFile, ProjectPhase, ServiceType, ProjectStatus } from '../types';

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
    `);

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
  const fileName = `${Date.now()}-${file.name}`;
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
