import { Link } from "@tanstack/react-router";

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <span className="font-ebg text-2xl">Notesify</span>
    </Link>
  );
};
