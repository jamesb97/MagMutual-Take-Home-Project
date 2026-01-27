import express, { Request, Response } from 'express';
import csv from 'csvtojson';
import path from 'path';

const app = express();
const port = 3000;

app.use(express.json());

interface User {
    user_id: string;
    first_name: string;
    last_name: string;
    profession: string;
    created_at: string;
    [key: string]: any;
}

let jsonObj: User[] = [];

// Read the data from the csv file
const csvFilePath = path.join(__dirname, 'data.csv');

csv()
    .fromFile(csvFilePath)
    .then((data: User[]) => {
        jsonObj = data;
        console.log("Data loaded from CSV");
    });

app.get("/", (req: Request, res: Response) => {
    res.send("Hello MagMutual!");
});

// Creating an endpoint to return a list of users
app.get("/users", (req: Request, res: Response) => {
    res.json(jsonObj);
});

// Creating an endpoint to return a list of users based on a specific profession
app.get("/users/profession/:profession", (req: Request, res: Response) => {
    const { profession } = req.params;
    if (typeof profession !== 'string') {
        return res.status(400).json({ error: "Profession must be a string" });
    }
    const users = jsonObj.filter((user) => user.profession.toLowerCase() === profession.toLowerCase());
    res.json(users);
});

// Creating an endpoint to return a list of users created between a date range
app.get("/users/date-range/:startDate/:endDate", (req: Request, res: Response) => {
    const { startDate, endDate } = req.params;
    if (typeof startDate !== 'string' || typeof endDate !== 'string') {
        return res.status(400).json({ error: "Start date and end date must be strings" });
    }
    const users = jsonObj.filter((user) => {
        const createdAt = new Date(user.created_at);
        return createdAt >= new Date(startDate) && createdAt <= new Date(endDate);
    });
    res.json(users);
});

// Creating an endpoint to return a specific user
app.get("/users/:id", (req: Request, res: Response) => {
    const userId = req.params.id;
    const user = jsonObj.find((user) => user.user_id === userId);
    res.json(user);
});

// Creating a custom endpoint
app.get("/custom", (req: Request, res: Response) => {
    const customData = {
        message: "This is a custom endpoint",
    };
    res.json(customData);
});

// Creating a custom endpoint to insert a new user
app.post("/users", (req: Request, res: Response) => {
    const user = req.body;
    jsonObj.push(user);
    res.json(user);
});

// Creating a custom search endpoint
app.get("/users/search", (req: Request, res: Response) => {
    const { name } = req.query;
    if (typeof name !== 'string') {
        return res.status(400).json({ error: "Name query parameter is required and must be a string" });
    }
    const users = jsonObj.filter((user) => 
        user.first_name.toLowerCase().includes(name.toLowerCase()) || 
        user.last_name.toLowerCase().includes(name.toLowerCase())
    );
    res.json(users);
});

app.listen(port, () => {
    console.log(`MagMutual app listening on port ${port}`);
});