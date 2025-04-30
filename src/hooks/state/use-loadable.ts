import { Atom, useAtomValue } from "jotai";
import { useEffect, useMemo } from "react";
import { loadable } from "jotai/utils";
import { WritableAtom, useSetAtom } from "jotai";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";

export const useLoadableAtom = <Value>(
  atom: Atom<Value>,
  messages?: {
    loading?: string;
    success?: string;
    error?: string;
  }
) => {
  const loadableAtom = useMemo(() => loadable(atom), []);
  const value = useAtomValue(loadableAtom);

  useEffect(() => {
    if (value.state === "hasData" && messages?.success) {
      toast.success(messages.success);
    }
    if (value.state === "loading" && messages?.loading) {
      toast.info(messages.loading);
    }
    if (value.state === "hasError" && messages?.error) {
      toast.error(messages.error);
    }
  }, [value.state, messages]);

  if (value.state === "hasData") {
    return {
      data: value.data,
      isLoading: false,
      hasError: false,
    };
  }
  return {
    data: null,
    isLoading: value.state === "loading",
    hasError: value.state === "hasError",
  };
};

// export const useAtomQuery = <Value, Arg, Result>(
//   queryKey: readonly unknown[],
//   atom: WritableAtom<Value, [Arg], Result>,
//   arg: Arg,
//   options?: UseQueryOptions<Result, unknown, Arg>
// ) => {
//   const actionFn = useSetAtom(atom);
//   return useQuery({
//     queryKey,
//     queryFn: async () => await actionFn(arg),
//     ...options,
//   });
// };
