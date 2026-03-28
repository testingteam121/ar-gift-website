import { useState, useEffect, useCallback } from 'react';
import { templateApi } from '@/lib/api';
import { Template, TemplateCategory } from '@/types';

interface UseTemplatesOptions {
  category?: TemplateCategory;
  autoFetch?: boolean;
}

interface UseTemplatesReturn {
  templates: Template[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTemplates(options: UseTemplatesOptions = {}): UseTemplatesReturn {
  const { category, autoFetch = true } = options;

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (category && category !== 'all') params.category = category;

      const { data } = await templateApi.getAll(params);
      setTemplates(data.templates || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    if (autoFetch) fetchTemplates();
  }, [fetchTemplates, autoFetch]);

  return { templates, loading, error, refetch: fetchTemplates };
}
