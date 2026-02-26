"use client";
import { useQuery } from "convex/react";
import z from "zod";
import { api } from "../../../../../convex/_generated/api";
import { useMutationState } from "@/hooks/useMutationState";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CirclePlus, X } from "lucide-react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

type Props = object;

const createGroupFormSchema = z.object({
  name: z.string().min(1, { error: "This field can't be empty" }),
  members: z
    .string()
    .array()
    .min(1, { error: "You must select atleast one user" }),
});

export default function CreateGroupDialog({}: Props) {
  const friends = useQuery(api.friends.getAllFriends);

  const { mutate: createGroup, pending } = useMutationState(
    api.chat.createGroup,
  );

  const form = useForm<z.infer<typeof createGroupFormSchema>>({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: { name: "", members: [] },
  });

  const members = form.watch("members", []);

  const unselectedFriends = useMemo(() => {
    return friends
      ? friends.filter((friend) => !members.includes(friend._id))
      : [];
  }, [members, friends]);

  async function handleSubmit(values: z.infer<typeof createGroupFormSchema>) {
    await createGroup({ name: values.name, members: values.members })
      .then(() => {
        form.reset();
        toast.success("Group created");
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
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline">
              <CirclePlus />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>

        <TooltipContent>
          <p>Create Group</p>
        </TooltipContent>
      </Tooltip>

      <DialogContent className="block">
        <DialogHeader className="mb-2">
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>Add your chats to get started</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="group-name">Name</FieldLabel>
                  <Input
                    id="group-name"
                    placeholder="Group name..."
                    {...field}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="members"
              control={form.control}
              render={({ fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Chats</FieldLabel>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      disabled={unselectedFriends.length === 0}
                    >
                      <Button className="w-full" variant="outline">
                        Select
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      {unselectedFriends.map((friend) => (
                        <DropdownMenuCheckboxItem
                          key={friend._id}
                          className="flex items-center gap-2 w-full p-2"
                          onCheckedChange={(checked) => {
                            if (checked) {
                              form.setValue("members", [
                                ...members,
                                friend._id,
                              ]);
                            }
                          }}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={friend.imageUrl} />
                            <AvatarFallback>
                              {friend.username.substring(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="truncate">{friend.username}</h4>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {members && members.length ? (
              <Card className="flex flex-row items-center gap-2 overflow-x-auto w-full h-22 p-2 no-scrollbar">
                {friends
                  ?.filter((friend) => members.includes(friend._id))
                  .map((friend) => (
                    <div
                      key={friend._id}
                      className="flex flex-col items-center gap-0.5"
                    >
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={friend.imageUrl} />
                          <AvatarFallback>
                            {friend.username.substring(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <X
                          className="text-muted-foreground w-3.5 h-3.5 absolute bottom-6 left-5 bg-muted rounded-full cursor-pointer"
                          onClick={() =>
                            form.setValue(
                              "members",
                              members.filter((id) => id !== friend._id),
                            )
                          }
                        />
                      </div>
                      <p className="truncate text-sm">
                        {friend.username.split(" ")[0]}
                      </p>
                    </div>
                  ))}
              </Card>
            ) : null}
          </FieldGroup>
          <DialogFooter>
            <Button
              disabled={pending}
              type="submit"
              className={
                pending ? "hover:cursor-not-allowed" : "hover:cursor-pointer"
              }
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
