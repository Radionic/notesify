import { useMutationState } from "@tanstack/react-query";

export function useUploadStatus(mutationKey: unknown[]) {
  const states = useMutationState({
    filters: { mutationKey, exact: true },
    select: (m) => ({
      status: m.state.status,
      error: m.state.error as Error | null,
    }),
  });
  return states?.[0] ?? { status: "idle" as const, error: null };
}
