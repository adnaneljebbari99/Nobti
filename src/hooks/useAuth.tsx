import { Session, User } from '@supabase/supabase-js';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
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
        try {
            const { data, error } = await supabase
                .from('admins')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                console.warn('Admin check failed:', error.message);
                return null;
            }
            return data as Admin;
        } catch (e) {
            return null;
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        async function initialize() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!mounted) return;

                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    const profile = await fetchAdminProfile(session.user.id);
                    if (mounted) setAdmin(profile);
                }
            } catch (err) {
                console.error('Init error:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        initialize();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth event:', event);
            if (!mounted) return;

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                const profile = await fetchAdminProfile(session.user.id);
                if (mounted) setAdmin(profile);
            } else {
                if (mounted) setAdmin(null);
            }

            if (mounted) setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
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
        <AuthContext.Provider value={{ user, admin, session, loading, signIn, signOut }}>
            {children}
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
