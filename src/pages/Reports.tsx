import { CheckCircle, Flag, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { PageContainer } from '../components/layout';
import { Button, Card, Modal, Table } from '../components/ui';
import { useReports } from '../hooks/useReports';
import { Report } from '../types';

export function Reports() {
    const { reports, loading, deleteReport, toggleVerified, toggleFlagged } = useReports();
    const [deleteConfirm, setDeleteConfirm] = useState<Report | null>(null);
    const [filter, setFilter] = useState<'all' | 'verified' | 'flagged'>('all');

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        await deleteReport(deleteConfirm.id);
        setDeleteConfirm(null);
    };

    const filteredReports = reports.filter((r) => {
        if (filter === 'verified') return r.is_verified;
        if (filter === 'flagged') return r.is_flagged;
        return true;
    });

    const columns = [
        {
            key: 'place',
            header: 'Place',
            render: (item: Report) => (
                <div>
                    <p className="font-medium text-gray-900">{item.place?.name || '-'}</p>
                    <p className="text-sm text-gray-500">{item.place?.city || '-'}</p>
                </div>
            ),
        },
        {
            key: 'wait_minutes',
            header: 'Wait Time',
            render: (item: Report) => (
                <span className="font-medium text-emerald-600">{item.wait_minutes} min</span>
            ),
        },
        {
            key: 'arrival_time',
            header: 'Arrival',
            render: (item: Report) => (
                <span className="text-gray-700">
                    {new Date(item.arrival_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
            ),
        },
        {
            key: 'created_at',
            header: 'Reported',
            render: (item: Report) => (
                <span className="text-gray-500 text-sm">
                    {new Date(item.created_at).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (item: Report) => (
                <div className="flex items-center gap-2">
                    {item.is_verified && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                            Verified
                        </span>
                    )}
                    {item.is_flagged && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            Flagged
                        </span>
                    )}
                    {!item.is_verified && !item.is_flagged && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                            Pending
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (item: Report) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVerified(item.id, !item.is_verified)}
                        title={item.is_verified ? 'Unverify' : 'Verify'}
                    >
                        {item.is_verified ? (
                            <XCircle size={16} className="text-gray-400" />
                        ) : (
                            <CheckCircle size={16} className="text-emerald-500" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFlagged(item.id, !item.is_flagged)}
                        title={item.is_flagged ? 'Unflag' : 'Flag'}
                    >
                        <Flag size={16} className={item.is_flagged ? 'text-red-500' : 'text-gray-400'} />
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
            title="Reports"
            description="View and manage user-submitted wait time reports"
            actions={
                <div className="flex items-center gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as 'all' | 'verified' | 'flagged')}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="all">All Reports</option>
                        <option value="verified">Verified Only</option>
                        <option value="flagged">Flagged Only</option>
                    </select>
                </div>
            }
        >
            <Card>
                <Table
                    columns={columns}
                    data={filteredReports}
                    keyExtractor={(item) => item.id}
                    loading={loading}
                    emptyMessage="No reports found."
                />
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Delete Report"
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
                    Are you sure you want to delete this report?
                    This action cannot be undone.
                </p>
            </Modal>
        </PageContainer>
    );
}
