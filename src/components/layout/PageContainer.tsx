import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface PageContainerProps {
    children: ReactNode;
    title: string;
    description?: string;
    actions?: ReactNode;
}

export function PageContainer({ children, title, description, actions }: PageContainerProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <main className="ml-64 p-8">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        {description && <p className="text-gray-500 mt-1">{description}</p>}
                    </div>
                    {actions && <div className="flex items-center gap-3">{actions}</div>}
                </div>

                {/* Page Content */}
                {children}
            </main>
        </div>
    );
}
