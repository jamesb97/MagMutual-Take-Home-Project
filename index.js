// Create a node server
const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello MagMutual!");
});

// Read the data from the csv file
const csvFilePath = "./data.csv";
const csv = require("csvtojson");
let jsonObj = [];

csv()
    .fromFile(csvFilePath)
    .then((data) => {
        jsonObj = data;
        console.log("Data loaded from CSV");
    });

// Create an endpoint to return all users
// app.get("/users", (req, res) => {
//     res.json(jsonObj);
// });

// Creating an endpoint to return a list of users
app.get("/users", (req, res) => {
    res.json(jsonObj);
});



// Creating an endpoint to return a list of users based on a specific profession
app.get("/users/profession/:profession", (req, res) => {
    const profession = req.params.profession;
    const users = jsonObj.filter((user) => user.profession.toLowerCase() === profession.toLowerCase());
    res.json(users);
});

// Creating an endpoint to return a list of users created between a date range
app.get("/users/date-range/:startDate/:endDate", (req, res) => {
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;
    const users = jsonObj.filter((user) => {
        const createdAt = new Date(user.created_at);
        return createdAt >= new Date(startDate) && createdAt <= new Date(endDate);
    });
    res.json(users);
});

// Creating an endpoint to return a specific user
app.get("/users/:id", (req, res) => {
    const userId = req.params.id;
    const user = jsonObj.find((user) => user.user_id === userId);
    res.json(user);
});

// Creating a custom endpoint
app.get("/custom", (req, res) => {
    const customData = {
        message: "This is a custom endpoint",
    };
    res.json(customData);
});

// Creating a custom endpoint to insert a new user
app.post("/users", (req, res) => {
    const user = req.body;
    jsonObj.push(user);
    res.json(user);
});

// Creating a custom search endpoint
app.get("/users/search", (req, res) => {
    const { name } = req.query;
    if (!name) {
        return res.status(400).json({ error: "Name query parameter is required" });
    }
    const users = jsonObj.filter((user) => 
        user.first_name.toLowerCase().includes(name.toLowerCase()) || 
        user.last_name.toLowerCase().includes(name.toLowerCase())
    );
    res.json(users);
});

// Deleting an endpoint
app.delete("/users/:id", (req, res) => {
    const userId = req.params.id;
    const user = jsonObj.find((user) => user.user_id === userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    jsonObj = jsonObj.filter((user) => user.user_id !== userId);
    res.json(user);
});

app.listen(port, () => {
    console.log(`MagMutual app listening on port ${port}`);
});
