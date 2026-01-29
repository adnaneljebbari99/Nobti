import { BarChart3, Clock, TrendingUp, Users } from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card } from '../components/ui';
import { useCategories } from '../hooks/useCategories';
import { usePlaces } from '../hooks/usePlaces';
import { useReports } from '../hooks/useReports';

export function Stats() {
    const { places } = usePlaces();
    const { reports } = useReports();
    const { categories } = useCategories();

    // Calculate stats by category
    const categoryStats = categories.map((category) => {
        const categoryPlaces = places.filter((p) => p.category_id === category.id);
        const totalReports = categoryPlaces.reduce((acc, p) => acc + p.report_count, 0);
        const avgWait = categoryPlaces.length > 0
            ? Math.round(categoryPlaces.reduce((acc, p) => acc + p.avg_wait_minutes, 0) / categoryPlaces.length)
            : 0;

        return {
            id: category.id,
            name: category.name,
            name_ar: category.name_ar,
            placeCount: categoryPlaces.length,
            reportCount: totalReports,
            avgWait,
        };
    });

    // Top 5 places by wait time
    const topWaitPlaces = [...places]
        .sort((a, b) => b.avg_wait_minutes - a.avg_wait_minutes)
        .slice(0, 5);

    // Top 5 places by reports
    const topReportPlaces = [...places]
        .sort((a, b) => b.report_count - a.report_count)
        .slice(0, 5);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentReports = reports.filter((r) => new Date(r.created_at) > sevenDaysAgo);

    // Calculate overall stats
    const totalPlaces = places.length;
    const activePlaces = places.filter((p) => p.is_active).length;
    const totalReports = reports.length;
    const verifiedReports = reports.filter((r) => r.is_verified).length;
    const overallAvgWait = places.length > 0
        ? Math.round(places.reduce((acc, p) => acc + p.avg_wait_minutes, 0) / places.length)
        : 0;

    return (
        <PageContainer
            title="Statistics"
            description="Analytics and insights for Nobti"
        >
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <BarChart3 className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active Places</p>
                            <p className="text-2xl font-bold text-gray-900">{activePlaces} / {totalPlaces}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 rounded-lg">
                            <Users className="text-emerald-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Reports</p>
                            <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
                            <p className="text-xs text-gray-400">{verifiedReports} verified</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Clock className="text-orange-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Avg Wait Time</p>
                            <p className="text-2xl font-bold text-gray-900">{overallAvgWait} min</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <TrendingUp className="text-purple-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Last 7 Days</p>
                            <p className="text-2xl font-bold text-gray-900">{recentReports.length} reports</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Category Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {categoryStats.map((stat) => (
                    <Card key={stat.id} title={`${stat.name_ar} (${stat.name})`}>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Places</span>
                                <span className="font-medium">{stat.placeCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Reports</span>
                                <span className="font-medium">{stat.reportCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Avg Wait</span>
                                <span className="font-medium text-emerald-600">{stat.avgWait} min</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Leaderboards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Longest Wait Times">
                    {topWaitPlaces.map((place, index) => (
                        <div key={place.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full text-sm font-medium">
                                    {index + 1}
                                </span>
                                <div>
                                    <p className="font-medium text-gray-900">{place.name}</p>
                                    <p className="text-sm text-gray-500">{place.city}</p>
                                </div>
                            </div>
                            <span className="font-medium text-red-600">{place.avg_wait_minutes} min</span>
                        </div>
                    ))}
                    {topWaitPlaces.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No data available</p>
                    )}
                </Card>

                <Card title="Most Reported Places">
                    {topReportPlaces.map((place, index) => (
                        <div key={place.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-full text-sm font-medium">
                                    {index + 1}
                                </span>
                                <div>
                                    <p className="font-medium text-gray-900">{place.name}</p>
                                    <p className="text-sm text-gray-500">{place.city}</p>
                                </div>
                            </div>
                            <span className="font-medium text-emerald-600">{place.report_count} reports</span>
                        </div>
                    ))}
                    {topReportPlaces.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No data available</p>
                    )}
                </Card>
            </div>
        </PageContainer>
    );
}
