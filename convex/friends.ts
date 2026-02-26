import { ConvexError } from "convex/values";
import { query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const getAllFriends = query({
  handler: async (ctx) => {
    const currentLoggedinUser = await ctx.auth.getUserIdentity();
    if (!currentLoggedinUser) throw new ConvexError("Unauthorized");

    const currentUser = await getUserByClerkId({
      ctx,
      clerkId: currentLoggedinUser.subject,
    });
    if (!currentUser) throw new ConvexError("User not found");

    const friendships1 = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("user1", currentUser._id))
      .collect();
    const friendships2 = await ctx.db
      .query("friends")
      .withIndex("by_user2", (q) => q.eq("user2", currentUser._id))
      .collect();

    const friendships = [...friendships1, ...friendships2];

    const friends = await Promise.all(
      friendships.map(async (friendship) => {
        const friend = await ctx.db.get(
          friendship.user1 === currentUser._id
            ? friendship.user2
            : friendship.user1,
        );

        if (!friend) throw new ConvexError("Friend couldn't be found");

        return friend;
      }),
    );

    return friends;
  },
});
