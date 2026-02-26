"use client";
import { Dispatch, SetStateAction } from "react";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { useMutationState } from "@/hooks/useMutationState";
import { api } from "../../../../../../../convex/_generated/api";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  chatId: Id<"chats">;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export default function LeaveGroupDialog({ chatId, open, setOpen }: Props) {
  const { mutate: leaveGroup, pending } = useMutationState(api.chat.leaveGroup);

  async function handleLeaveGroup() {
    leaveGroup({ chatId })
      .then(() => {
        toast.success("Group Left");
      })
      .catch((error) =>
        toast.error(
          error instanceof ConvexError
            ? error.data
            : "Unexpected error occured",
        ),
      );
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. You will not be able to see any
            previous messages or send new messages to this group.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={pending} onClick={handleLeaveGroup}>
            Leave
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
