## Getting Started

First, install all dependencies using

```bash
npm install
```

Then, run below command to create account and project on convex cloud

```bash
npx convex dev
```

Then, create your account and project in clerk and paste necessary env variables in .env.local file created in your root folder.

Then, follow this [Docs](https://docs.convex.dev/auth/clerk#nextjs) to integrate clerk with convex. To get your jwt from clerk and add it in your convex dashboard's environment section and also in your .env.local file.

Also, create a webhook in clerk dashboard with "NEXT_PUBLIC_CONVEX_SITE_URL(see .env.local or convex dashboard for this site link)/clerk-users-webhook" and add the webhook secret in .env.local and also in Environment variables of convex.

Finally, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
