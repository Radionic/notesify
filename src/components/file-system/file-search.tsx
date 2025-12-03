import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect } from "react";
import { useDebounceValue } from "usehooks-ts";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export const FileSearch = () => {
  const searchParams = useSearch({ from: "/library/" });
  const navigate = useNavigate();
  const [debouncedQuery, setQuery] = useDebounceValue(searchParams.q, 500);

  useEffect(() => {
    navigate({
      to: "/library",
      search: { q: debouncedQuery || undefined },
      replace: true,
    });
  }, [debouncedQuery, navigate]);

  return (
    <InputGroup className="w-64">
      <InputGroupInput
        placeholder="Search..."
        onChange={(e) => {
          const value = e.target.value;
          setQuery(value);
        }}
      />
      <InputGroupAddon>
        <Search className="h-4 w-4" />
      </InputGroupAddon>
    </InputGroup>
  );
};
