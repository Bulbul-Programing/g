const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

app.use(cors({
    origin: ['http://localhost:5173', 'http://meghnamall.web.app'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

app.use(express.json())
require('dotenv').config()

const uri = "mongodb+srv://meghnamallbusiness:ei45.bulbul@meghnamallnew.w5ewpc0.mongodb.net/";

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
        // await client.connect();
        // Send a ping to confirm a successful connection

        const productCollection = client.db('bongoKids').collection('products')
        const ordersCollection = client.db('bongoKids').collection('orders')
        const adminCollection = client.db('bongoKids').collection('admin')

        // all get operations

        app.get('/all/products', async (req, res) => {
            const result = await productCollection.find().sort({ date: -1 }).toArray()
            res.send(result)
        })

        app.get('/single/product/:id', async (req, res) => {
            console.log('bulbul');
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(filter)
            res.send(result)
        })

        app.get('/get/product/:gender', async (req, res) => {
            const gender = req.params.gender
            const filter = { gender: gender }
            const result = await productCollection.find(filter).toArray()
            res.send(result)
        })

        app.get('/search/product/vi/:name', async (req, res) => {
            const searchTitle = req.params.name
            const filter = { productName: new RegExp(searchTitle, 'i') }
            const result = await productCollection.find(filter).toArray()
            res.send(result)
        })

        app.get('/search/product/:category', async (req, res) => {
            const searchCategory = req.params.category
            const filter = { ProductCategory: new RegExp(searchCategory, 'i') }
            const result = await productCollection.find(filter).toArray()
            res.send(result)
        })

        app.get('/search/vi/price', async (req, res) => {
            const minPrice = req.query.minPrice
            const maxPrice = req.query.maxPrice
            const filter = {
                discountPrice: {
                    $gt: minPrice,
                    $lt: maxPrice
                }
            }
            const result = await productCollection.find(filter).toArray()
            res.send(result)
        })

        app.get('/product/details/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(filter)
            res.send(result)
        })
        app.get('/product/category/:category', async (req, res) => {
            const category = req.params.category
            const filter = { ProductCategory: category }
            const result = await productCollection.find(filter).toArray()
            res.send(result)
        })

        app.post('/get/cartItem/products', async (req, res) => {
            const productID = req.body
            const filter = { _id: { '$in': productID.map(id => new ObjectId(id)) } }
            const result = await productCollection.find(filter).sort({ date: -1 }).toArray()
            res.send(result)
        })

        app.get('/get/all/order', async (req, res) => {
            const result = await ordersCollection.find().sort({ date: -1, status: -1 }).toArray()
            res.send(result)
        })

        app.get('/get/single/order/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await ordersCollection.findOne(filter)
            res.send(result)
        })

        app.get('/get/all/admin', async (req, res) => {
            const result = await adminCollection.find().sort({ date: -1 }).toArray()
            res.send(result)
        })

        app.get(`/get/isAdmin/:email`, async (req, res) => {
            const email = req.params.email
            const filter = { email: email }
            const result = await adminCollection.findOne(filter)
            res.send(result)
        })

        // all post operations

        app.post('/add/new/product', async (req, res) => {
            const productData = req.body
            const result = await productCollection.insertOne(productData)
            res.send(result)
        })

        app.post('/add/new/order', async (req, res) => {
            const orderData = req.body
            const result = await ordersCollection.insertOne(orderData)
            res.send(result)
        })

        app.post('/add/admin', async (req, res) => {
            const adminData = req.body
            const filter = { email: adminData.email }
            const isExisted = await adminCollection.findOne(filter)
            if (!isExisted) {
                const result = await adminCollection.insertOne(adminData)
                res.send(result)
            }
            else {
                res.send({ massage: 'already admin' })
            }
        })

        // all put operations
        app.put('/update/order/status/:id', async (req, res) => {
            const { status } = req.body
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    status: `${status}`
                }
            }
            const result = await ordersCollection.updateOne(filter, updateDoc, option)
            res.send(result)
        })

        app.put('/update/product/condition/:id', async (req, res) => {
            const id = req.params.id
            const productCondition = req.body
            const filter = { _id: new ObjectId(id) }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    condition: productCondition.condition
                }
            }
            const result = await productCollection.updateOne(filter, updateDoc, option)
            res.send(result)
        })


        // all delete operations
        app.delete('/delete/product/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = productCollection.deleteOne(filter)
            res.send(result)
        })

        app.delete('/remove/order/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await ordersCollection.deleteOne(filter)
            res.send(result)
        })

        app.delete('/delete/admin/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await adminCollection.deleteOne(filter)
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('meghna mall server is running')
})

app.listen(port, () => {
    console.log(`server is running ${port}`);
})