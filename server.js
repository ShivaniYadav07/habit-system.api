import express from "express"

const app = express();

app.get("/api/jokes", (req, res) => {
    const jokes = [
        {
          "id": 1,
          "title": "Why don't skeletons fight each other?",
          "content": "Because they don't have the guts!"
        },
        {
          "id": 2,
          "title": "What did the ocean say to the beach?",
          "content": "Nothing, it just waved!"
        },
        {
          "id": 3,
          "title": "Why did the scarecrow win an award?",
          "content": "Because he was outstanding in his field!"
        },
        {
          "id": 4,
          "title": "What do you call cheese that isn't yours?",
          "content": "Nacho cheese!"
        },
        {
          "id": 5,
          "title": "Why couldn’t the bicycle stand up by itself?",
          "content": "Because it was two-tired!"
        }
      ]
      
    res.send(jokes);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is listening on port: http://localhost:${port}`)
})