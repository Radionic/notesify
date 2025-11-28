import type { ReactNode } from "react";

export const FixedContainer = ({ children }: { children: ReactNode }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {children}
    </div>
  );
};
