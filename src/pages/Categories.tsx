import { Edit2, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { PageContainer } from '../components/layout';
import { Button, Card, Input, Modal, Table } from '../components/ui';
import { useCategories } from '../hooks/useCategories';
import { Category, CategoryFormData } from '../types';

export function Categories() {
    const { categories, loading, createCategory, updateCategory, deleteCategory, toggleActive } = useCategories();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        name_ar: '',
        icon: '',
        is_active: true,
        display_order: 0,
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);

    const openCreateModal = () => {
        setEditingCategory(null);
        setFormData({ name: '', name_ar: '', icon: '', is_active: true, display_order: categories.length });
        setFormError('');
        setIsModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            name_ar: category.name_ar,
            icon: category.icon || '',
            is_active: category.is_active,
            display_order: category.display_order,
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.name_ar) {
            setFormError('Name and Arabic name are required');
            return;
        }

        setSubmitting(true);
        const result = editingCategory
            ? await updateCategory(editingCategory.id, formData)
            : await createCategory(formData);

        if (result.error) {
            setFormError(result.error);
        } else {
            setIsModalOpen(false);
        }
        setSubmitting(false);
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        await deleteCategory(deleteConfirm.id);
        setDeleteConfirm(null);
    };

    const columns = [
        {
            key: 'name',
            header: 'Name (EN)',
            render: (item: Category) => (
                <span className="font-medium text-gray-900">{item.name}</span>
            ),
        },
        {
            key: 'name_ar',
            header: 'Name (AR)',
            render: (item: Category) => (
                <span className="font-medium text-gray-900" dir="rtl">{item.name_ar}</span>
            ),
        },
        {
            key: 'display_order',
            header: 'Order',
            render: (item: Category) => (
                <span className="text-gray-500">{item.display_order}</span>
            ),
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (item: Category) => (
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
            render: (item: Category) => (
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
            title="Categories"
            description="Manage place categories (bank, hospital, government)"
            actions={
                <Button onClick={openCreateModal}>
                    <Plus size={20} className="mr-2" />
                    Add Category
                </Button>
            }
        >
            <Card>
                <Table
                    columns={columns}
                    data={categories}
                    keyExtractor={(item) => item.id}
                    loading={loading}
                    emptyMessage="No categories found. Create your first category."
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCategory ? 'Edit Category' : 'Create Category'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} loading={submitting}>
                            {editingCategory ? 'Update' : 'Create'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Name (English)"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="bank"
                    />
                    <Input
                        label="Name (Arabic)"
                        value={formData.name_ar}
                        onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                        placeholder="بنك"
                        dir="rtl"
                    />
                    <Input
                        label="Icon (optional)"
                        value={formData.icon || ''}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="building-2"
                    />
                    <Input
                        label="Display Order"
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
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
                title="Delete Category"
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
                    This action cannot be undone.
                </p>
            </Modal>
        </PageContainer>
    );
}
