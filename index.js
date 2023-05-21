const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nmjlal4.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
     


        const serviceCollection = client.db('toyLand').collection('services')


        // const indexKeys = { toy_name: 1 };
        // const indexOptions = { name: "ToyName" };

        // const result = await serviceCollection.createIndex(indexKeys, indexOptions);

        app.get("/toySearchByToy/:text", async (req, res) => {
            const searchText = req.params.text;

            const result = await serviceCollection.find({
                $or: [
                    { toy_name: { $regex: searchText, $options: "i" } }
                ]
            }).toArray()
            res.send(result)
        })


        app.get("/allToys/:text", async (req, res) => {
            if (req.params.text == "science" || req.params.text == "math learning" || req.params.text || "engineering") {
                const result = await serviceCollection
                    .find({ section: req.params.text }).limit(2)
                    .toArray();
                return res.send(result)
            }
            const result = await serviceCollection.find({}).toArray();
            res.send(result)
        });


        app.get("/allToy", async (req, res) => {
            const cursor = serviceCollection.find().limit(20);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/allToy/:id', async (req, res) => {
            const id = req.params.id

            const filter = { _id: new ObjectId(id) }

            const data = await serviceCollection.findOne(filter)

            res.send(data)

        })


        app.get('/allToy/:id', async(req, res)=>{
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await serviceCollection.findOne(query);
            res.send(result)
        })

        app.post('/addToy', async (req, res) => {
            const newToy = req.body;
            console.log(newToy)
            const result = await serviceCollection.insertOne(newToy);
            res.send(result);
        })

        app.get('/myToys/:email', async (req, res) => {
            console.log(req.params.email)
            const result = await serviceCollection.find({ seller_email: req.params.email }).toArray();
            res.send(result);
        })

        app.delete('/allToy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await serviceCollection.deleteOne(query);
            res.send(result)
        })

        app.put('/allToy/:id', async(req, res)=>{
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = {upsert: true};
            const updatedToy = req.body;
            const toy = {
                $set:{
                    seller_name:updatedToy.seller_name,
                    toy_name:updatedToy.toy_name,
                    section:updatedToy.section,
                    price:updatedToy.price,
                    available_quantity:updatedToy.available_quantity,
                    detail_description :updatedToy.detail_description,
                    img_url:updatedToy.img_url,
                    rating:updatedToy.rating
                }
            }
            const result = await serviceCollection.updateOne(filter, toy, options);
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Toy is Playing')
})


app.listen(port, () => {
    console.log(`Toy Server is playing on port ${port}`)
})