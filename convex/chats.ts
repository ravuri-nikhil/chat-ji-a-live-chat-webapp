import { ConvexError } from "convex/values";
import { query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";
import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getAllChats = query({
  handler: async (ctx) => {
    const currentLoggedinUser = await ctx.auth.getUserIdentity();
    if (!currentLoggedinUser) throw new ConvexError("Unauthorized");

    const currentUser = await getUserByClerkId({
      ctx,
      clerkId: currentLoggedinUser.subject,
    });
    if (!currentUser) throw new ConvexError("User not found");

    const chatMemberships = await ctx.db
      .query("chatMembers")
      .withIndex("by_memberId", (q) => q.eq("memberId", currentUser._id))
      .collect();

    const chats = await Promise.all(
      chatMemberships?.map(async (membership) => {
        const chat = await ctx.db.get(membership.chatId);
        if (!chat) {
          throw new ConvexError("Chat could not be found");
        }
        return chat;
      }),
    );

    const chatsWithDetails = await Promise.all(
      chats.map(async (chat) => {
        const allChatMemberships = await ctx.db
          .query("chatMembers")
          .withIndex("by_chatId", (q) => q.eq("chatId", chat?._id))
          .collect();

        const lastMessage = await getLastMessageDetails({
          ctx,
          id: chat.lastMessageId,
        });

        if (chat.isGroup) {
          return { chat, lastMessage };
        } else {
          const otherMembership = allChatMemberships.filter(
            (membership) => membership.memberId !== currentUser._id,
          )[0];

          const otherMember = await ctx.db.get(otherMembership.memberId);

          return { chat, otherMember, lastMessage };
        }
      }),
    );

    return chatsWithDetails;
  },
});

async function getLastMessageDetails({
  ctx,
  id,
}: {
  ctx: QueryCtx | MutationCtx;
  id: Id<"messages"> | undefined;
}) {
  if (!id) return null;

  const message = await ctx.db.get(id);

  if (!message) return null;

  const sender = await ctx.db.get(message.senderId);

  if (!sender) return null;

  const content = getMessageContent(
    message.type,
    message.content as unknown as string,
  );

  return { content, sender: sender.username };
}

function getMessageContent(type: string, content: string) {
  switch (type) {
    case "text":
      return content;
    default:
      return "[Non-text]";
  }
}
