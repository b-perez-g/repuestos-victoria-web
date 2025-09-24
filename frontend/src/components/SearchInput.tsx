//components/SearchInput.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/categories/all?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[600px]">
      <label
        className="flex items-center border border-gray-300 rounded-md px-3 py-2
                   bg-white text-gray-900
                   focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500 w-full"
      >
        <MagnifyingGlassIcon className="h-6 w-6 mr-2 text-gray-400" />
        <input
          type="search"
          placeholder="Buscar productos"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-grow bg-transparent outline-none text-gray-900 placeholder-gray-500"
        />
      </label>
    </form>
  );
}
