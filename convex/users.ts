import { ConvexError } from "convex/values";
import { query } from "./_generated/server";

export const getAllExceptMe = query({
  handler: async (ctx) => {
    const currentLoggedinUser = await ctx.auth.getUserIdentity();
    if (!currentLoggedinUser) throw new ConvexError("Unauthorized");

    const allUsersExceptMe = await ctx.db
      .query("users")
      .withIndex("by_clerkId")
      .filter((q) => q.neq(q.field("clerkId"), currentLoggedinUser.subject))
      .collect();

    return allUsersExceptMe;
  },
});
