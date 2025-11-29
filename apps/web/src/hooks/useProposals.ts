import { useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalsApi } from '../api/proposals';

// Re-export existing hooks from useApi.ts
export {
  useProposals,
  useProposal,
  useCreateProposal,
  useUpdateProposal,
  useDeleteProposal,
  useSendProposal,
} from './useApi';

// Additional mutations for accept/decline
export function useAcceptProposal(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proposalsApi.accept(projectId, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'proposals'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'proposals', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeclineProposal(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proposalsApi.decline(projectId, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'proposals'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'proposals', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
