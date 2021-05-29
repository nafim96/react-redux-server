const express = require("express");
const cors = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;
require("dotenv").config();
const app = express();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dhpuh.mongodb.net/${process.env.DB_DATA_BASE}?retryWrites=true&w=majority`;
const port = 5000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Hello Programmer");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  console.log("get err", err);
  const productCollection = client
    .db(`${process.env.DB_DATA_BASE}`)
    .collection(`${process.env.DB_CL_PRODUCT}`);

  const adminCollection = client
    .db(`${process.env.DB_DATA_BASE}`)
    .collection(`${process.env.DB_CL_ADMIN}`);
  console.log("get admin", adminCollection);

  //create admin get admin and query admin area
  app.post("/addAdmin", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    adminCollection.insertOne({ name, email }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  //get admin for using admin panel.
  app.get("/admin", (req, res) => {
    adminCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // when check the admin is there? find the admin in this collection
  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email }).toArray((err, admin) => {
      res.send(admin.length > 0);
    });
  });
  //close admin functionality working

  //Add product method
  app.post("/addProduct", (req, res) => {
    const product = req.body;
    productCollection.insertOne(product).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // get product method
  app.get("/products", (req, res) => {
    productCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // find product using id
  app.get("/placeProduct/:id", (req, res) => {
    productCollection
      .find({ _id: objectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });

  //product delete method
  app.delete("/deleteProduct/:id", (req, res) => {
    productCollection
      .findOneAndDelete({ _id: objectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(!!documents.value);
      });
  });
});

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
