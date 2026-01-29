import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Place, PlaceFormData } from '../types';

export function usePlaces() {
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPlaces = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('places')
                .select(`
          *,
          category:categories(*)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPlaces(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch places');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlaces();
    }, [fetchPlaces]);

    const createPlace = async (data: PlaceFormData): Promise<{ error: string | null }> => {
        try {
            const { error } = await supabase.from('places').insert(data);
            if (error) throw error;
            await fetchPlaces();
            return { error: null };
        } catch (err) {
            return { error: err instanceof Error ? err.message : 'Failed to create place' };
        }
    };

    const updatePlace = async (id: string, data: Partial<PlaceFormData>): Promise<{ error: string | null }> => {
        try {
            const { error } = await supabase
                .from('places')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
            await fetchPlaces();
            return { error: null };
        } catch (err) {
            return { error: err instanceof Error ? err.message : 'Failed to update place' };
        }
    };

    const deletePlace = async (id: string): Promise<{ error: string | null }> => {
        try {
            const { error } = await supabase.from('places').delete().eq('id', id);
            if (error) throw error;
            await fetchPlaces();
            return { error: null };
        } catch (err) {
            return { error: err instanceof Error ? err.message : 'Failed to delete place' };
        }
    };

    const toggleActive = async (id: string, isActive: boolean): Promise<{ error: string | null }> => {
        return updatePlace(id, { is_active: isActive });
    };

    return {
        places,
        loading,
        error,
        fetchPlaces,
        createPlace,
        updatePlace,
        deletePlace,
        toggleActive,
    };
}
