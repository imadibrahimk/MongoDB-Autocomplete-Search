const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = 3000;

// MongoDB setup
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let stocksCollection;

async function connectToDatabase() {
  try {
    await client.connect();
    stocksCollection = client.db("AutoCompleteSearch").collection("stocks");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
connectToDatabase();

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve static HTML page
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint for autocomplete search
app.get('/search', async (req, res) => {
  const query = req.query.q?.toLowerCase() || '';

  if (query === '') {
    return res.json([]);
  }

  try {
    const results = await stocksCollection
      .find({ name: { $regex: `^${query}`, $options: 'i' } })
      .limit(10)
      .toArray();

    res.json(results.map(result => result.name));
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
