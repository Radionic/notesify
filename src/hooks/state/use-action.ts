import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { WritableAtom, useSetAtom } from "jotai";
import { useState } from "react";
import { toast } from "sonner";

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export const useAction = <Value, Args extends unknown[], Result>(
  atom: WritableAtom<Value, Args, Result>,
  messages?: (...args: Args) => {
    loading?: string;
    success?: string;
    error?: string;
  }
) => {
  const actionFn = useSetAtom(atom);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const actionFnWrapped = async (
    ...args: Args
  ): Promise<Result | undefined> => {
    try {
      setIsLoading(true);

      const result = await (messages
        ? toast
            .promise(actionFn(...args) as Promise<Result>, messages(...args))
            .unwrap()
        : actionFn(...args));
      setHasError(false);
      return result;
    } catch (error) {
      console.error("Action error:", error);
      const message =
        messages?.(...args)?.error ||
        (error instanceof ActionError
          ? error.message
          : "An unexpected error occurred");
      toast.error(message);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };
  // return { action: actionFnWrapped, hasError, isLoading };
  return [actionFnWrapped, isLoading] as const;
};

// export const useAction = <Value, Arg, Result>(
//   atom: WritableAtom<Value, [Arg], Result>,
//   options?: UseMutationOptions<Result, unknown, Arg>
// ) => {
//   const actionFn = useSetAtom(atom);
//   return useMutation({
//     mutationFn: async (arg) => await actionFn(arg),
//     ...options,
//   });
// };
