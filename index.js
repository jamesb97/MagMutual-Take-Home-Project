// Create a node server
const express = require("express");
const fs = require("fs");
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
        console.log("Data successfully loaded from CSV");
    })
    .catch((err) => {
        console.error("FAILED to load CSV data:", err);
    });

// Helper function to save data back to CSV
const saveToCsv = () => {
    try {
        const { parse } = require("json2csv");
        const csvData = parse(jsonObj);
        fs.writeFileSync(csvFilePath, csvData);
        console.log("Data successfully saved to CSV");
    } catch (err) {
        console.error("ERROR saving to CSV:", err);
    }
};

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
    saveToCsv();
    res.json(user);
});

// Creating a custom search endpoint
app.get("/users/search/:name", (req, res) => {
    const name = req.params.name;
    const users = jsonObj.filter((user) => 
        user.first_name.toLowerCase().includes(name.toLowerCase()) || 
        user.last_name.toLowerCase().includes(name.toLowerCase())
    );
    res.json(users);
});

// Creating a custom endpoint to update a user
app.put("/users/:id", (req, res) => {
    const userId = req.params.id;
    const userIndex = jsonObj.findIndex((user) => user.user_id === userId);
    if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
    }
    
    // Update fields while keeping existing ones if not provided
    jsonObj[userIndex] = {
        ...jsonObj[userIndex],
        ...req.body,
        user_id: userId // Ensure ID doesn't change
    };
    
    saveToCsv();
    res.json(jsonObj[userIndex]);
});

// Creating a custom endpoint to compare users
app.get("/users/compare/:name", (req, res) => {
    const name = req.params.name;
    const users = jsonObj.filter((user) => 
        user.first_name.toLowerCase().includes(name.toLowerCase()) || 
        user.last_name.toLowerCase().includes(name.toLowerCase())
    );
    res.json(users);
});

app.get("/users/compare-ids/:id1/:id2", (req, res) => {
    const user1 = jsonObj.find((u) => u.user_id === req.params.id1);
    const user2 = jsonObj.find((u) => u.user_id === req.params.id2);
    res.json({ user1, user2 });
});

// Creating a custom endpoint to insert a new row
app.post("/users", (req, res) => {
    jsonObj = jsonObj.map((user) => ({
        ...user,
        place: req.body.place || ""
    }));
    saveToCsv();
    res.json({ message: "Column 'place' added to all users", count: jsonObj.length });
});

// Creating a custom endpoint to delete a row
app.delete("/users/remove-place", (req, res) => {
    jsonObj = jsonObj.map(({ place, ...user }) => user);
    saveToCsv();
    res.json({ message: "Column 'place' removed from all users" });
});


// Deleting new row
// app.delete("/users/delete-row/:id", (req, res) => {
//     const userId = req.params.id;
//     const user = jsonObj.find((u) => u.user_id === userId);
//     if (!user) {
//         return res.status(404).json({ error: "User not found" });
//     }
//     jsonObj = jsonObj.filter((u) => u.user_id !== userId);
//     saveToCsv();
//     res.json({ message: "User deleted successfully", user });
// });

// Deleting an endpoint
app.delete("/users/:id", (req, res) => {
    const userId = req.params.id;
    const user = jsonObj.find((user) => user.user_id === userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    jsonObj = jsonObj.filter((user) => user.user_id !== userId);
    saveToCsv();
    res.json(user);
});

const server = app.listen(port, () => {
    console.log(`MagMutual app listening on port ${port}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`ERROR: Port ${port} is already in use. Please stop the other process or use a different port.`);
    } else {
        console.error("SERVER ERROR:", err);
    }
    process.exit(1);
});
