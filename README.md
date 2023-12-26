This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## DB

Our DB is a mongo instance hosted on atlas. To use it locally, you must have a `.env.local` file with the correct configuration. 
This configuration must reference an existing DB with the necessaries collections created in them. If the collections are empty, they can be populated with given scripts.
The collections that have to be created by hands are `features` and `games` (both this collections must be under the same database).

### Configuration

Update your file `.env.local` with these new fields (update the `CHANGE_ME` values):
```
DB_USERNAME=CHANGE_ME
DB_PASSWORD=CHANGE_ME
DB_CLUSTER=evolution.dxcrvij.mongodb.net
DATABASE_NAME=CHANGE_ME
```
This configuration should be enough to communicate with the DB.

### Populate the DB

To reset the DB with basic data, the script `./dbScripts/loadData.sh` can be ran. For this, you must have configured your DB and installed the [mongo db shell](https://www.mongodb.com/try/download/shell) and [mongoimport](https://www.mongodb.com/docs/database-tools/mongoimport/).

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
