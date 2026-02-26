import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const createFriendship = mutation({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentLoggedinUser = await ctx.auth.getUserIdentity();
    if (!currentLoggedinUser) throw new ConvexError("Unauthorized");

    const currentUser = await getUserByClerkId({
      ctx,
      clerkId: currentLoggedinUser.subject,
    });
    if (!currentUser) throw new ConvexError("User not found");

    const friends1 = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("user1", currentUser._id))
      .collect();
    const friends2 = await ctx.db
      .query("friends")
      .withIndex("by_user2", (q) => q.eq("user2", currentUser._id))
      .collect();

    if (
      friends1.some((friend) => friend.user2 === args.id) ||
      friends2.some((friend) => friend.user1 === args.id)
    ) {
      return friends1[0]?.chatId || friends2[0]?.chatId;
      // throw new ConvexError("You are already friends with this user");
    }

    const chatId = await ctx.db.insert("chats", { isGroup: false });

    await ctx.db.insert("friends", {
      user1: currentUser._id,
      user2: args.id,
      chatId,
    });

    await ctx.db.insert("chatMembers", {
      memberId: currentUser._id,
      chatId,
    });
    await ctx.db.insert("chatMembers", {
      memberId: args.id,
      chatId,
    });

    return chatId;
  },
});

export const removeFriendship = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const currentLoggedinUser = await ctx.auth.getUserIdentity();
    if (!currentLoggedinUser) throw new ConvexError("Unauthorized");

    const currentUser = await getUserByClerkId({
      ctx,
      clerkId: currentLoggedinUser.subject,
    });
    if (!currentUser) throw new ConvexError("User not found");

    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new ConvexError("Chat not found");

    const memberships = await ctx.db
      .query("chatMembers")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();

    if (!memberships || memberships.length !== 2)
      throw new ConvexError("This chat doesn't have any members");

    const friendship = await ctx.db
      .query("friends")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .unique();

    if (!friendship) throw new ConvexError("Friend couldn't be found");

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();

    await ctx.db.delete(args.chatId);
    await ctx.db.delete(friendship._id);

    await Promise.all(
      memberships.map(async (membership) => {
        await ctx.db.delete(membership._id);
      }),
    );
    await Promise.all(
      messages.map(async (message) => {
        await ctx.db.delete(message._id);
      }),
    );
  },
});
