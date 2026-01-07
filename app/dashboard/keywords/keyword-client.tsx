'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { createKeywords, updateKeyword, deleteKeyword, deleteKeywords } from '@/app/actions/keywords';
import { Plus, Search, Trash2, Edit2, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

interface Keyword {
    id: number;
    text: string;
}

interface Props {
    initialKeywords: Keyword[];
    total: number;
    currentPage: number;
    totalPages: number;
}

export default function KeywordClient({ initialKeywords, total, currentPage, totalPages }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, setIsPending] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        params.set('page', '1');
        router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const openAddModal = () => {
        setEditingKeyword(null);
        setInputValue('');
        setIsModalOpen(true);
    };

    const openEditModal = (keyword: Keyword) => {
        setEditingKeyword(keyword);
        setInputValue(keyword.text);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        setIsPending(true);
        try {
            if (editingKeyword) {
                await updateKeyword(editingKeyword.id, inputValue);
            } else {
                // Bulk create
                const result = await createKeywords(inputValue);
                if (result.errors > 0) {
                    alert(`Imported ${result.created} keywords. Skipped ${result.errors} duplicates/errors.`);
                }
            }
            setIsModalOpen(false);
            setInputValue('');
            router.refresh(); // Refresh server data
        } catch (error) {
            alert('Operation failed');
        } finally {
            setIsPending(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this keyword?')) return;
        setIsPending(true);
        try {
            await deleteKeyword(id);
            router.refresh();
        } catch (error) {
            alert('Delete failed');
        } finally {
            setIsPending(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === initialKeywords.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(initialKeywords.map(k => k.id)));
        }
    };

    const toggleSelect = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} keywords?`)) return;
        setIsPending(true);
        try {
            await deleteKeywords(Array.from(selectedIds));
            setSelectedIds(new Set());
            router.refresh();
        } catch (error) {
            alert('Bulk delete failed');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Keyword Management</h2>
                    <p className="text-neutral-400">Total keywords: {total}</p>
                </div>
                <div className="flex gap-2">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg flex items-center font-medium transition-colors"
                        >
                            <Trash2 className="w-5 h-5 mr-2" />
                            Delete Selected ({selectedIds.size})
                        </button>
                    )}
                    <button
                        onClick={openAddModal}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center font-medium transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Keywords
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-neutral-800 rounded-xl leading-5 bg-neutral-900 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search keywords..."
                    defaultValue={searchParams.get('search')?.toString()}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-800">
                        <thead className="bg-neutral-950">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left">
                                    <input
                                        type="checkbox"
                                        checked={initialKeywords.length > 0 && selectedIds.size === initialKeywords.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-neutral-700 bg-neutral-800 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                    ID
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                    Text
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-neutral-900 divide-y divide-neutral-800">
                            {initialKeywords.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                                        No keywords found.
                                    </td>
                                </tr>
                            ) : (
                                initialKeywords.map((keyword) => (
                                    <tr key={keyword.id} className="hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(keyword.id)}
                                                onChange={() => toggleSelect(keyword.id)}
                                                className="rounded border-neutral-700 bg-neutral-800 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                            {keyword.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-200">
                                            {keyword.text}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => openEditModal(keyword)}
                                                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(keyword.id)}
                                                    className="text-red-400 hover:text-red-300 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-neutral-950 px-4 py-3 border-t border-neutral-800 flex items-center justify-between sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-neutral-400">
                                    Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-700 bg-neutral-900 text-sm font-medium text-neutral-400 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-700 bg-neutral-900 text-sm font-medium text-neutral-400 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Next</span>
                                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-white">
                                {editingKeyword ? 'Edit Keyword' : 'Add New Keywords'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label htmlFor="keyword" className="block text-sm font-medium text-neutral-300 mb-2">
                                    {editingKeyword ? 'Keyword Text' : 'Keywords (one per line)'}
                                </label>
                                {editingKeyword ? (
                                    <input
                                        type="text"
                                        id="keyword"
                                        required
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Enter keyword..."
                                        autoFocus
                                    />
                                ) : (
                                    <textarea
                                        id="keyword"
                                        required
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        rows={8}
                                        className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Enter keywords..."
                                        autoFocus
                                    />
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center"
                                >
                                    {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {editingKeyword ? 'Save Changes' : 'Add Keywords'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
