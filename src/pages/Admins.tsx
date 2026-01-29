import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout';
import { Button, Card, Input, Modal, Select, Table } from '../components/ui';
import { supabase } from '../lib/supabase';
import { Admin } from '../types';

export function Admins() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ user_id: '', role: 'admin' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('admins').select('*');
            if (error) throw error;
            setAdmins(data || []);
        } catch (err: any) {
            console.error('Error fetching admins:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleCreateAdmin = async () => {
        if (!formData.user_id) return;
        setSubmitting(true);
        setError('');
        try {
            const { error } = await supabase.from('admins').upsert(formData, { onConflict: 'user_id' });
            if (error) throw error;
            await fetchAdmins();
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAdmin = async (id: string) => {
        if (!confirm('Are you sure you want to remove this admin?')) return;
        try {
            const { error } = await supabase.from('admins').delete().eq('id', id);
            if (error) throw error;
            await fetchAdmins();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const columns = [
        {
            key: 'user_id',
            header: 'User ID',
            render: (item: Admin) => <span className="text-xs font-mono">{item.user_id}</span>,
        },
        {
            key: 'role',
            header: 'Role',
            render: (item: Admin) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.role === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                    {item.role}
                </span>
            ),
        },
        {
            key: 'created_at',
            header: 'Added On',
            render: (item: Admin) => new Date(item.created_at).toLocaleDateString(),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (item: Admin) => (
                <Button variant="ghost" size="sm" onClick={() => handleDeleteAdmin(item.id)}>
                    <Trash2 size={16} className="text-red-500" />
                </Button>
            ),
        },
    ];

    return (
        <PageContainer
            title="Admins"
            description="Manage administrative access"
            actions={
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} className="mr-2" />
                    Add Admin
                </Button>
            }
        >
            <Card>
                <Table
                    columns={columns}
                    data={admins}
                    keyExtractor={(item) => item.id}
                    loading={loading}
                    emptyMessage="No admins found."
                />
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Promote User to Admin"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateAdmin} loading={submitting}>Promote</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="User ID"
                        value={formData.user_id}
                        onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                        placeholder="User GUID from Auth"
                    />
                    <Select
                        label="Role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        options={[
                            { value: 'admin', label: 'Admin' },
                            { value: 'superadmin', label: 'Super Admin' },
                        ]}
                    />
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
            </Modal>
        </PageContainer>
    );
}
