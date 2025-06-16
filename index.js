const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sn9xggj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.sn9xggj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const assignmentsCollection = client
      .db("assignmentDB")
      .collection("assignments");
    const MyAttemptsCollection = client
      .db("assignmentDB")
      .collection("MyAttempts");

    app.get("/assignments", async (req, res) => {
      const result = await assignmentsCollection.find().toArray();
      res.send(result);
    });



    app.get("/myattemps", async (req, res) => {
      res.send(await MyAttemptsCollection.find().toArray());
    });
    app.post("/myattemps", async (req, res) => {
      res.send(await MyAttemptsCollection.insertOne(req.body));
    });



    app.post("/assignments", async (req, res) => {
      newAssignment = req.body;
      console.log(newAssignment);
      const result = await assignmentsCollection.insertOne(newAssignment);
      res.send(result);
    });

    app.get("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentsCollection.findOne(query);
      res.send(result);
    });

    app.put("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateAssignment = req.body;
      const updateDoc = {
        $set: updateAssignment,
      };
      const result = await assignmentsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // ORG
    // app.delete("/assignments/:id", async(req, res) => {
    //   const id = req.params.id;
    //   const query = {_id: new ObjectId(id)}
    //   const result = await assignmentsCollection.deleteOne(query);
    //   res.send(result)
    // })

    app.delete("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const requesterEmail = req.query.email;

      const assignment = await assignmentsCollection.findOne({
        _id: new ObjectId(id),
      });

      if (assignment?.createdBy !== requesterEmail) {
        return res.status(403).send({
          error: "Forbidden: You can only delete your own assignments.",
        });
      }

      const result = await assignmentsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("The server is getting now.");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
