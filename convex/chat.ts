import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
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
    } else {
      const otherMembers = await Promise.all(
        allChatMemberships
          .filter((membership) => membership.memberId !== currentUser._id)
          .map(async (membership) => {
            const member = await ctx.db.get(membership.memberId);
            if (!member) throw new ConvexError("Member couldn't be found");
            return { username: member.username };
          }),
      );

      return { ...chat, otherMembers, otherMember: null };
    }
  },
});

export const createGroup = mutation({
  args: {
    members: v.array(v.id("users")),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const currentLoggedinUser = await ctx.auth.getUserIdentity();
    if (!currentLoggedinUser) throw new ConvexError("Unauthorized");

    const currentUser = await getUserByClerkId({
      ctx,
      clerkId: currentLoggedinUser.subject,
    });
    if (!currentUser) throw new ConvexError("User not found");

    const chatId = await ctx.db.insert("chats", {
      isGroup: true,
      name: args.name,
    });

    await Promise.all(
      [...args.members, currentUser._id].map(async (memberId) => {
        await ctx.db.insert("chatMembers", {
          memberId,
          chatId,
        });
      }),
    );
  },
});

export const deleteGroup = mutation({
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

    if (!memberships)
      throw new ConvexError("This chat doesn't have any members");

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();

    await ctx.db.delete(args.chatId);

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

export const leaveGroup = mutation({
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

    const membership = await ctx.db
      .query("chatMembers")
      .withIndex("by_memberId_chatId", (q) =>
        q.eq("memberId", currentUser._id).eq("chatId", args.chatId),
      )
      .unique();

    if (!membership)
      throw new ConvexError("You are not a member of this group");

    await ctx.db.delete(membership._id);
  },
});
