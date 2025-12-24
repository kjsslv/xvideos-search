"use client";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react"; // Added Menu/X for potential future mobile menu
import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";

export default function Navbar() {
    const [query, setQuery] = useState("");
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            const slug = slugify(query);
            router.push(`/s/${slug}.html`);
            setIsMobileSearchOpen(false);
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur-md shadow-lg shadow-black/50">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-red-600 font-bold text-white group-hover:bg-red-700 transition-colors">P</div>
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent group-hover:to-white transition-all">
                        PHIMSEX<span className="text-red-500">.BOO</span>
                    </span>
                </Link>

                {/* Desktop Search */}
                <form onSubmit={handleSearch} className="hidden md:flex relative w-1/3 max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm video... (ví dụ: gái xinh, học sinh)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full rounded-full bg-zinc-900 border border-zinc-800 px-5 py-2.5 text-sm text-gray-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all font-medium"
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-zinc-800 text-gray-400 hover:text-red-400 transition-colors">
                        <Search size={18} />
                    </button>
                </form>

                {/* Mobile Actions */}
                <div className="flex md:hidden items-center gap-4">
                    <button
                        onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                        className="text-gray-300 hover:text-white"
                    >
                        {isMobileSearchOpen ? <X size={24} /> : <Search size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Search Bar (Collapsible) */}
            {isMobileSearchOpen && (
                <div className="md:hidden border-t border-white/10 bg-zinc-900/50 px-4 py-3 animate-in fade-in slide-in-from-top-2">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm video..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                            className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-base text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Search size={20} />
                        </button>
                    </form>
                </div>
            )}
        </nav>
    );
}
