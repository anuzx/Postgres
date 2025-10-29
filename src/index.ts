import express from "express";
import { Client } from "pg";

const app = express();
app.use(express.json());

const pgClient = new Client(process.env.LINK);

pgClient.connect();

//first do this in neon console
/*
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    street VARCHAR(255) NOT NULL,
    pincode VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);*/

app.post("/signup", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  const city = req.body.city;
  const country = req.body.country;
  const street = req.body.street;
  const pincode = req.body.pincode;
  //$ way of writing is used to secure from sql injection
  try {
    const insertQuery = `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id;`;

    const addressInsertQuery = `INSERT INTO addresses (city, country, street, pincode, user_id) VALUES ($1, $2, $3, $4, $5);`;

    //transaction
    await pgClient.query("BEGIN;");
    const response = await pgClient.query(insertQuery, [
      username,
      email,
      password,
    ]);

    const userId = response.rows[0].id; //console.log(response) and then see where id is stored no need to mug this up

    const addressInsertResponse = await pgClient.query(addressInsertQuery, [
      city,
      country,
      street,
      pincode,
      userId,
    ]);
    await pgClient.query("COMMIT;;");
    //transaction end

    res.json({
      message: "You have signed up",
    });
  } catch (e) {
    console.log(e);
    res.json({
      message: "Error while signing up",
    });
  }
});

//poor way to join tabels
app.get("/metadata", async (req, res) => {
  const id = req.query.id;

  const query1 = `SELECT username, email, id FROM users WHERE id=$1;`;
  const response1 = await pgClient.query(query1, [id]);

  const query2 = `SELECT * FROM addresses WHERE user_id=$1;`;
  const response2 = await pgClient.query(query2, [id]);

  res.json({
    user: response1.rows[0],
    address: response2.rows,
  });
});

//better way of joining
app.get("/better-metadata", async (req, res) => {
    const id = req.query.id;
    
  const query = `SELECT users.id, users.username, users.email, addresses.city, 
  addresses.country, addresses.street, addresses.pincode 
  FROM users JOIN addresses ON users.id = addresses.user_id 
  WHERE users.id = $1;`;

  const response = await pgClient.query(query, [id]);
  res.json({
    response :response.rows
  });
});

app.listen(3000, () => console.log("server staretd at 3000"));
