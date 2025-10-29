import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pgClient = new Client(process.env.LINK);

async function main() {
    await pgClient.connect(); //we cannot use await in open so we will have to wrap it inside a async fxn
    const response = await pgClient.query("UPDATE users SET username='Anuj'")
    console.log(response.rows)
}
main();
