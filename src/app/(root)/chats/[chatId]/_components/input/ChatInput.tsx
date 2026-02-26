"use client";
import { Card } from "@/components/ui/card";
import { useChat } from "@/hooks/useChat";
import { useMutationState } from "@/hooks/useMutationState";
import z from "zod";
import { api } from "../../../../../../../convex/_generated/api";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import TextareaAutosize from "react-textarea-autosize";
import { Field, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";

const chatMessageSchema = z.object({
  content: z.string().min(1, { error: "This field can't be empty" }),
});

export default function ChatInput() {
  const { chatId } = useChat();
  const { mutate: createMessage, pending } = useMutationState(
    api.message.createMessage,
  );

  const form = useForm<z.infer<typeof chatMessageSchema>>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: { content: "" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleInputChange(event: any) {
    const { value, selectionStart } = event.target;
    if (selectionStart !== null) {
      form.setValue("content", value);
    }
  }

  async function handleSubmit(values: z.infer<typeof chatMessageSchema>) {
    createMessage({ chatId, type: "text", content: [values.content] })
      .then(() => form.reset())
      .catch((error) => {
        toast.error(
          error instanceof ConvexError
            ? error.data
            : "Unexpected error occured",
        );
      })
      .finally(() => form.setFocus("content"));
  }

  return (
    <Card className="w-full p-2 rounded-lg relative">
      <div className="flex gap-2 items-end w-full">
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex gap-2 items-end w-full"
        >
          <Controller
            name="content"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                className="w-full h-full"
                data-invalid={fieldState.invalid}
              >
                <TextareaAutosize
                  aria-invalid={fieldState.invalid}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      await form.handleSubmit(handleSubmit)();
                    }
                  }}
                  rows={1}
                  maxRows={3}
                  {...field}
                  placeholder="Type your message..."
                  autoComplete="off"
                  onChange={handleInputChange}
                  onClick={handleInputChange}
                  className="min-h-full w-full resize-none border-0 outline-0 bg-card text-card-foreground placeholder:text-muted-foreground p-1.5"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Button disabled={pending} size="icon" type="submit">
            <SendHorizonal />
          </Button>
        </form>
      </div>
    </Card>
  );
}
