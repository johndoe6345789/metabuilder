import { useEffect } from 'react';
import { toast } from '@metabuilder/components/fakemui';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectIsAuthenticated,
  selectSnippetComments,
  selectCommentsLoading,
} from '@/store/selectors';
import {
  fetchSnippetComments,
  addSnippetComment,
} from '@/store/slices/commentsSlice';

export function useSnippetComments(snippetId: string) {
  const dispatch = useAppDispatch();
  const comments = useAppSelector(
    state => selectSnippetComments(state, snippetId)
  );
  const loading = useAppSelector(selectCommentsLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    dispatch(fetchSnippetComments(snippetId));
  }, [dispatch, snippetId]);

  async function handleSubmit(content: string) {
    try {
      await dispatch(
        addSnippetComment({ snippetId, content })
      ).unwrap();
    } catch {
      toast.error('Failed to post comment');
    }
  }

  return { comments, loading, isAuthenticated, handleSubmit };
}
