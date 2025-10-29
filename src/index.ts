import express from "express";
import { Client } from "pg";

const app = express();
app.use(express.json());

const pgClient = new Client(
  process.env.LINK
);

pgClient.connect();

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

    const response = await pgClient.query(insertQuery, [
      username,
      email,
      password,
    ]);
console.log(response)
    const userId = response.rows[0].id; //console.log(response) and then see where id is stored no need to mug this up

    const addressInsertQuery = `INSERT INTO addresses (city, country, street, pincode, user_id) VALUES ($1, $2, $3, $4, $5);`;

    const addressInsertResponse = await pgClient.query(addressInsertQuery, [
      city,
      country,
      street,
      pincode,
      userId,
    ]);

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

app.listen(3000 , ()=>console.log("server staretd at 3000"));
