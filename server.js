const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static('./'))
app.use(cors());

let port = 4200;
app.listen(port, () => console.log('Server listening on port '+port));

const MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID;

let db;
let Resumes;
// connect to the database
MongoClient.connect('mongodb+srv://amj311:be13strong51@cluster0-u6luc.mongodb.net/resume', { useNewUrlParser: true, useUnifiedTopology: true }, (err,client)=>{
  if (err) return console.error(err)
  console.log('Connected to Database')
  db = client.db("resumes");
  Resumes = db.collection("resumes");
});


app.use("/api/", (req, res, next)=>{
  if (!db) {
    res.status(500);
    res.send("Database is not connected.")
  }
  else next();
});

// Fetch all resumes
app.get('/api/resume/all', async(req, res) => {
  console.log("Get all Resumes");

  Resumes.find({}).toArray(function(err, list) {
    if (!err) {
      res.status(200);
      res.json({resumes:list})
    }
    else {
      console.log(err)
      res.status(500);
      res.json({ok:false});
    }
  });
});



// Create a new resume entry
app.post('/api/resume/create', async(req, res) => {
  console.log("Create Resume");

  Resumes.insertOne(req.body).then(result=>{
    // console.log(result.result)
    let success = result.insertedCount >= 1;
    if (success) {
      console.log("Saved!")
      res.status(200);
      res.json({newId:result.ops[0]._id})
    }
    else {
      console.log("Not saved...")
      res.status(500);
      res.json({ok:false});
    }
  });
});


// Update a resume in database
app.put('/api/resume/update', async(req, res) => {
  console.log("Update Resume");
  let id = req.body._id;
  delete req.body._id;
  
  Resumes.replaceOne(
    { "_id": new ObjectID(id) },
    req.body
  ).then(result=>{
    let success = result.modifiedCount >= 1;
    if (success) {
      console.log("Saved!")
      res.sendStatus(200);
    }
    else {
      console.log("Not saved...")
      res.status(500);
      res.json({ok:false});
    }
  })
  .catch(err=>{
    console.log("Error:")
    res.status(500);
    res.json({ok:false});
    console.log(err)
  });
});


// Delete a resume in database
app.delete('/api/resume/:id', async(req, res) => {
  console.log("Delete Resume");
  let id = req.params.id;
  
  Resumes.deleteOne({ "_id": new ObjectID(id) }).then(result=>{
    let success = result.deletedCount == 1;
    if (success) {
      console.log("Deleted!")
      res.sendStatus(200);
    }
    else {
      console.log("Not deleted...")
      res.status(500);
      res.json({ok:false});
    }
  })
  .catch(err=>{
    console.log("Error:")
    res.status(500);
    res.json({ok:false});
  });
});
