import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CollaborationRequest {
  id: string;
  name: string;
  email: string;
  project_description: string;
  skills?: string;
  created_at: string;
}

export const useCollaboration = () => {
  const queryClient = useQueryClient();

  const { data: collaborations, isLoading } = useQuery({
    queryKey: ['collaboration-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaboration_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CollaborationRequest[];
    },
  });

  const createCollaboration = useMutation({
    mutationFn: async (request: Omit<CollaborationRequest, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('collaboration_requests')
        .insert([request])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration-requests'] });
      toast.success("Collaboration request submitted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to submit collaboration request");
      console.error('Error creating collaboration:', error);
    },
  });

  return {
    collaborations,
    isLoading,
    createCollaboration,
  };
};
