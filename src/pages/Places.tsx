import { Edit2, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { PageContainer } from '../components/layout';
import { Button, Card, Input, Modal, Select, Table } from '../components/ui';
import { useCategories } from '../hooks/useCategories';
import { usePlaces } from '../hooks/usePlaces';
import { Place, PlaceFormData } from '../types';

export function Places() {
    const { places, loading, createPlace, updatePlace, deletePlace, toggleActive } = usePlaces();
    const { categories } = useCategories();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlace, setEditingPlace] = useState<Place | null>(null);
    const [formData, setFormData] = useState<PlaceFormData>({
        name: '',
        city: '',
        category_id: '',
        address: '',
        is_active: true,
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<Place | null>(null);

    const openCreateModal = () => {
        setEditingPlace(null);
        setFormData({
            name: '',
            city: '',
            category_id: categories[0]?.id || '',
            address: '',
            is_active: true,
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const openEditModal = (place: Place) => {
        setEditingPlace(place);
        setFormData({
            name: place.name,
            city: place.city,
            category_id: place.category_id,
            address: place.address || '',
            is_active: place.is_active,
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.city || !formData.category_id) {
            setFormError('Name, city, and category are required');
            return;
        }

        setSubmitting(true);
        const result = editingPlace
            ? await updatePlace(editingPlace.id, formData)
            : await createPlace(formData);

        if (result.error) {
            setFormError(result.error);
        } else {
            setIsModalOpen(false);
        }
        setSubmitting(false);
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        await deletePlace(deleteConfirm.id);
        setDeleteConfirm(null);
    };

    const categoryOptions = categories.map((c) => ({ value: c.id, label: `${c.name_ar} (${c.name})` }));

    const columns = [
        {
            key: 'name',
            header: 'Name',
            render: (item: Place) => (
                <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.address || '-'}</p>
                </div>
            ),
        },
        {
            key: 'city',
            header: 'City',
            render: (item: Place) => (
                <span className="text-gray-700">{item.city}</span>
            ),
        },
        {
            key: 'category',
            header: 'Category',
            render: (item: Place) => (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {item.category?.name_ar || '-'}
                </span>
            ),
        },
        {
            key: 'stats',
            header: 'Stats',
            render: (item: Place) => (
                <div className="text-sm">
                    <p><span className="font-medium text-emerald-600">{item.avg_wait_minutes}</span> min avg</p>
                    <p className="text-gray-500">{item.report_count} reports</p>
                </div>
            ),
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (item: Place) => (
                <button
                    onClick={() => toggleActive(item.id, !item.is_active)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${item.is_active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                >
                    {item.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {item.is_active ? 'Active' : 'Inactive'}
                </button>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (item: Place) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>
                        <Edit2 size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(item)}>
                        <Trash2 size={16} className="text-red-500" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <PageContainer
            title="Places"
            description="Manage locations (banks, hospitals, government offices)"
            actions={
                <Button onClick={openCreateModal}>
                    <Plus size={20} className="mr-2" />
                    Add Place
                </Button>
            }
        >
            <Card>
                <Table
                    columns={columns}
                    data={places}
                    keyExtractor={(item) => item.id}
                    loading={loading}
                    emptyMessage="No places found. Create your first place."
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingPlace ? 'Edit Place' : 'Create Place'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} loading={submitting}>
                            {editingPlace ? 'Update' : 'Create'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="البنك الشعبي - الدار البيضاء"
                    />
                    <Input
                        label="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="الدار البيضاء"
                    />
                    <Select
                        label="Category"
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        options={categoryOptions}
                    />
                    <Input
                        label="Address (optional)"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="شارع محمد الخامس"
                    />
                    {formError && (
                        <p className="text-sm text-red-600">{formError}</p>
                    )}
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Delete Place"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </>
                }
            >
                <p>
                    Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
                    This will also delete all associated reports.
                </p>
            </Modal>
        </PageContainer>
    );
}
