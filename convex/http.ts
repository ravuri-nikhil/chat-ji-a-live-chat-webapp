import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";

const validatePayload = async (req: Request): Promise<WebhookEvent | null> => {
  const payload = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return webhook.verify(payload, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error verifying Clerk webhook event", error);
    return null;
  }
};

const handleClerkWebhook = httpAction(async (ctx, req) => {
  const event = await validatePayload(req);
  if (!event) {
    return new Response("Couldn't validate clerk payload", { status: 400 });
  }
  switch (event.type) {
    case "user.created":
      const user = await ctx.runQuery(internal.user.get, {
        clerkId: event.data.id,
      });
      if (user) {
        console.log(`Updating user ${event.data.id} with ${event.data}`);
      }
    case "user.updated":
      console.log("Creating/updating user:", event.data.id);

      await ctx.runMutation(internal.user.create, {
        username: `${event.data.first_name} ${event.data.last_name}`,
        imageUrl: event.data.image_url,
        clerkId: event.data.id,
        email: event.data.email_addresses[0].email_address,
      });
      break;
    default:
      console.log("Clerk webhook event not supported", event.type);
  }
  return new Response(null, { status: 200 });
});

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});
export default http;
