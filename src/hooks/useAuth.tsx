import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Admin } from '../types';

interface AuthContextType {
    user: User | null;
    admin: Admin | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAdminProfile = useCallback(async (userId: string) => {
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Error fetching admin profile:', error);
            return null;
        }
        return data as Admin;
    }, []);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchAdminProfile(session.user.id).then(setAdmin);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                const adminProfile = await fetchAdminProfile(session.user.id);
                setAdmin(adminProfile);
            } else {
                setAdmin(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [fetchAdminProfile]);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error as Error | null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setAdmin(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value= {{ user, admin, session, loading, signIn, signOut }
}>
    { children }
    </AuthContext.Provider>
  );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
