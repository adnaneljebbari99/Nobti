import { FileText, FolderTree, MapPin, TrendingUp } from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card } from '../components/ui';
import { useCategories } from '../hooks/useCategories';
import { usePlaces } from '../hooks/usePlaces';
import { useReports } from '../hooks/useReports';

export function Dashboard() {
    const { categories } = useCategories();
    const { places } = usePlaces();
    const { reports } = useReports();

    const stats = [
        {
            label: 'Categories',
            value: categories.filter(c => c.is_active).length,
            total: categories.length,
            icon: FolderTree,
            color: 'bg-blue-500',
        },
        {
            label: 'Active Places',
            value: places.filter(p => p.is_active).length,
            total: places.length,
            icon: MapPin,
            color: 'bg-emerald-500',
        },
        {
            label: 'Total Reports',
            value: reports.length,
            total: reports.filter(r => r.is_verified).length,
            icon: FileText,
            color: 'bg-purple-500',
            suffix: 'verified',
        },
        {
            label: 'Avg Wait Time',
            value: places.length > 0
                ? Math.round(places.reduce((acc, p) => acc + p.avg_wait_minutes, 0) / places.length)
                : 0,
            icon: TrendingUp,
            color: 'bg-orange-500',
            suffix: 'min',
        },
    ];

    return (
        <PageContainer
            title="Dashboard"
            description="Welcome to the Nobti admin dashboard"
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <Card key={stat.label} className="relative overflow-hidden">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {stat.value}
                                    {stat.suffix && <span className="text-lg font-normal text-gray-500 ml-1">{stat.suffix}</span>}
                                </p>
                                {stat.total !== undefined && stat.label !== 'Total Reports' && (
                                    <p className="text-sm text-gray-400 mt-1">of {stat.total} total</p>
                                )}
                                {stat.label === 'Total Reports' && (
                                    <p className="text-sm text-gray-400 mt-1">{stat.total} verified</p>
                                )}
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon size={24} className="text-white" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Recent Places">
                    {places.slice(0, 5).map((place) => (
                        <div key={place.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div>
                                <p className="font-medium text-gray-900">{place.name}</p>
                                <p className="text-sm text-gray-500">{place.city}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium text-emerald-600">{place.avg_wait_minutes} min</p>
                                <p className="text-sm text-gray-500">{place.report_count} reports</p>
                            </div>
                        </div>
                    ))}
                    {places.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No places yet</p>
                    )}
                </Card>

                <Card title="Recent Reports">
                    {reports.slice(0, 5).map((report) => (
                        <div key={report.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div>
                                <p className="font-medium text-gray-900">{report.wait_minutes} min wait</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(report.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {report.is_verified && (
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                                        Verified
                                    </span>
                                )}
                                {report.is_flagged && (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                        Flagged
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {reports.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No reports yet</p>
                    )}
                </Card>
            </div>
        </PageContainer>
    );
}
