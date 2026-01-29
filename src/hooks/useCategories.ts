import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Category, CategoryFormData } from '../types';

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const createCategory = async (data: CategoryFormData): Promise<{ error: string | null }> => {
        try {
            const { error } = await supabase.from('categories').insert(data);
            if (error) throw error;
            await fetchCategories();
            return { error: null };
        } catch (err) {
            return { error: err instanceof Error ? err.message : 'Failed to create category' };
        }
    };

    const updateCategory = async (id: string, data: Partial<CategoryFormData>): Promise<{ error: string | null }> => {
        try {
            const { error } = await supabase
                .from('categories')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
            await fetchCategories();
            return { error: null };
        } catch (err) {
            return { error: err instanceof Error ? err.message : 'Failed to update category' };
        }
    };

    const deleteCategory = async (id: string): Promise<{ error: string | null }> => {
        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            await fetchCategories();
            return { error: null };
        } catch (err) {
            return { error: err instanceof Error ? err.message : 'Failed to delete category' };
        }
    };

    const toggleActive = async (id: string, isActive: boolean): Promise<{ error: string | null }> => {
        return updateCategory(id, { is_active: isActive });
    };

    return {
        categories,
        loading,
        error,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        toggleActive,
    };
}
