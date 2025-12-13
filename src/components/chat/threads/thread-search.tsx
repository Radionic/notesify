import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface ThreadSearchProps {
  searchTerm: string;
  onSearch: (term: string) => void;
}

export const ThreadSearch = ({ searchTerm, onSearch }: ThreadSearchProps) => {
  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
        size={16}
      />
      <Input
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        className="peer pe-9 ps-9"
        placeholder="Search by chat title..."
      />
    </div>
  );
};
