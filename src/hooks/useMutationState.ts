/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "convex/react";
import { useState } from "react";

export function useMutationState(mutationToRun: any) {
  const [pending, setPending] = useState(false);
  const mutationFn = useMutation(mutationToRun);

  const mutate = async (payload: any) => {
    setPending(true);

    return mutationFn(payload)
      .then((res) => {
        return res;
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => setPending(false));
  };

  return { mutate, pending };
}
