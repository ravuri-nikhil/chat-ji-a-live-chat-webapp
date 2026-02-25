import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const getChat = query({
  args: {
    id: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const currentLoggedinUser = await ctx.auth.getUserIdentity();
    if (!currentLoggedinUser) throw new ConvexError("Unauthorized");

    const currentUser = await getUserByClerkId({
      ctx,
      clerkId: currentLoggedinUser.subject,
    });
    if (!currentUser) throw new ConvexError("User not found");

    const chat = await ctx.db.get(args.id);
    if (!chat) {
      throw new ConvexError("Chat not found");
    }

    const membership = await ctx.db
      .query("chatMembers")
      .withIndex("by_memberId_chatId", (q) =>
        q.eq("memberId", currentUser._id).eq("chatId", chat._id),
      )
      .unique();

    if (!membership) {
      throw new ConvexError("You aren't a member of this chat");
    }

    const allChatMemberships = await ctx.db
      .query("chatMembers")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.id))
      .collect();

    if (!chat.isGroup) {
      const otherMembership = allChatMemberships.filter(
        (membership) => membership.memberId !== currentUser._id,
      )[0];
      const otherMemberDetails = await ctx.db.get(otherMembership.memberId);

      return {
        ...chat,
        otherMember: {
          ...otherMemberDetails,
          lastSeenMessageId: otherMembership.lastSeenMessage,
        },
        otherMembers: null,
      };
    }
  },
});
