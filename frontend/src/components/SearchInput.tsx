//components/SearchInput.tsx
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function SearchInput() {
  return (
    <label
      className="flex items-center border rounded-md px-3 py-2
                 bg-background text-text 
                 focus-within:ring-2 focus-within:ring-accent w-full max-w-[600px]"
    >
      <MagnifyingGlassIcon className="h-6 w-6 mr-2" />
      <input
        type="search"
        placeholder="Buscar productos"
        className="flex-grow bg-transparent outline-none text-[inherit]"
      />
    </label>
  );
}
