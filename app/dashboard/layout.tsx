import Link from 'next/link';
import { Home, Key } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col">
                    <div className="p-6 border-b border-neutral-800">
                        <h1 className="text-xl font-bold tracking-tight text-white">Dashboard</h1>
                    </div>
                    <nav className="flex-1 p-4 space-y-1">
                        <Link
                            href="/"
                            className="flex items-center px-4 py-2.5 text-sm font-medium text-neutral-400 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors"
                        >
                            <Home className="w-4 h-4 mr-3" />
                            Main Site
                        </Link>
                        <Link
                            href="/dashboard/keywords"
                            className="flex items-center px-4 py-2.5 text-sm font-medium text-white bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors"
                        >
                            <Key className="w-4 h-4 mr-3" />
                            Keywords
                        </Link>

                        <div className="mt-8 border-t border-neutral-800 pt-4">
                            <form action={async () => {
                                'use server';
                                const { logout } = await import('@/app/actions/auth');
                                await logout();
                            }}>
                                <button
                                    type="submit"
                                    className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-red-400 rounded-lg hover:bg-neutral-800 hover:text-red-300 transition-colors"
                                    title="Sign Out"
                                >
                                    <code className="text-xs mr-3">←]</code>
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto bg-neutral-950">
                    <div className="p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
