import { Client, Account, Databases, ID } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);

// Database constants
export const DATABASE_ID = 'wish_wall_db';
export const FRIENDS_COLLECTION_ID = 'friends';
export const FOLLOWS_COLLECTION_ID = 'follows';

export { client, account, databases, ID };
