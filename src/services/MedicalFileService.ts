import { supabase } from '../lib/supabase';
import { MedicalFile } from '../types';

export async function getAllMedicalFiles(): Promise<MedicalFile[]> {
  try {
    const [filesRes, profilesRes] = await Promise.all([
      supabase.from('medical_files').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name')
    ]);

    if (filesRes.error || !filesRes.data) {
      console.error('Error fetching medical files:', filesRes.error);
      return [];
    }

    const profilesMap = new Map<string, string>();
    if (profilesRes.data) {
      for (const p of profilesRes.data) {
        profilesMap.set(p.id, p.full_name || 'Patient');
      }
    }

    return filesRes.data.map((f: any) => {
      const patientId = f.user_id || f.patient_id || '';
      const patientName = f.patient_name || profilesMap.get(patientId) || 'Patient';

      return {
        id: f.id,
        patient_id: patientId,
        patient_name: patientName,
        title: f.title || f.file_name || 'Medical Record',
        category: f.category || 'General',
        created_at: f.created_at ? new Date(f.created_at).toLocaleDateString() : 'N/A',
        uploaded_by: f.uploaded_by || 'Clinical Diagnostic',
        file_size: f.size_bytes ? `${(f.size_bytes / 1024 / 1024).toFixed(2)} MB` : (f.file_size || 'Unknown Size'),
        file_type: f.file_type || 'PDF',
        reviewed: f.reviewed !== false,
        notes: f.notes || '',
        file_path: f.file_path
      };
    });
  } catch (err) {
    console.error('Error in getAllMedicalFiles:', err);
    return [];
  }
}

export async function createMedicalFile(file: Omit<MedicalFile, 'id' | 'created_at'>, actualFile?: File): Promise<MedicalFile | null> {
  try {
    let filePath = '';
    let fileSize = 0;
    
    if (actualFile) {
      const fileExt = actualFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      filePath = `medical-files/${fileName}`;
      fileSize = actualFile.size;
      
      const { error: uploadError } = await supabase.storage
        .from('medical-files')
        .upload(filePath, actualFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error('Error uploading medical file:', uploadError);
        return null;
      }
    }

    const { data, error } = await supabase
      .from('medical_files')
      .insert([{
        user_id: file.patient_id || null,
        title: file.title,
        category: file.category,
        file_name: actualFile?.name || 'document.pdf',
        file_path: filePath,
        file_type: file.category,
        size_bytes: fileSize,
        reviewed: file.reviewed ?? true,
        notes: file.notes || ''
      }])
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating medical file DB record:', error);
      return null;
    }

    return {
      id: data.id,
      patient_id: data.user_id || '',
      patient_name: file.patient_name || 'Patient',
      title: data.title || data.file_name || 'Medical Record',
      category: data.category || 'General',
      created_at: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'N/A',
      uploaded_by: data.uploaded_by || 'Clinical Diagnostic',
      file_size: data.size_bytes ? `${(data.size_bytes / 1024 / 1024).toFixed(2)} MB` : 'Unknown Size',
      file_type: data.file_type || 'PDF',
      reviewed: data.reviewed !== false,
      notes: data.notes || '',
      file_path: data.file_path
    };
  } catch (err) {
    console.error('Error in createMedicalFile:', err);
    return null;
  }
}

export async function toggleFileReviewed(id: string, reviewed: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('medical_files')
      .update({ reviewed })
      .eq('id', id);
    if (error) {
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error in toggleFileReviewed:', err);
    return false;
  }
}
