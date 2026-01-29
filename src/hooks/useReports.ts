import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Report } from '../types';

export function useReports() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReports = useCallback(async (placeId?: string) => {
        try {
            setLoading(true);
            setError(null);
            let query = supabase
                .from('reports')
                .select(`
          *,
          place:places(id, name, city)
        `)
                .order('created_at', { ascending: false })
                .limit(100);

            if (placeId) {
                query = query.eq('place_id', placeId);
            }

            const { data, error } = await query;

            if (error) throw error;
            setReports(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const deleteReport = async (id: string): Promise<{ error: string | null }> => {
        try {
            const { error } = await supabase.from('reports').delete().eq('id', id);
            if (error) throw error;
            await fetchReports();
            return { error: null };
        } catch (err) {
            return { error: err instanceof Error ? err.message : 'Failed to delete report' };
        }
    };

    const toggleVerified = async (id: string, isVerified: boolean): Promise<{ error: string | null }> => {
        try {
            const { error } = await supabase
                .from('reports')
                .update({ is_verified: isVerified })
                .eq('id', id);
            if (error) throw error;
            await fetchReports();
            return { error: null };
        } catch (err) {
            return { error: err instanceof Error ? err.message : 'Failed to update report' };
        }
    };

    const toggleFlagged = async (id: string, isFlagged: boolean): Promise<{ error: string | null }> => {
        try {
            const { error } = await supabase
                .from('reports')
                .update({ is_flagged: isFlagged })
                .eq('id', id);
            if (error) throw error;
            await fetchReports();
            return { error: null };
        } catch (err) {
            return { error: err instanceof Error ? err.message : 'Failed to update report' };
        }
    };

    return {
        reports,
        loading,
        error,
        fetchReports,
        deleteReport,
        toggleVerified,
        toggleFlagged,
    };
}
