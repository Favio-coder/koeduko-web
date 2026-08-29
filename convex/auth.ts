import { query } from "./_generated/server";
import { v } from "convex/values";

export const login = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("usuario")
      .withIndex("por_email", (q) => q.eq("email", args.email))
      .first();
    return user ?? null;
  },
});