var express = require('express');
var app = express();
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var dotenv = require('dotenv');


dotenv.config();
// var mongoLocalUrl = process.env.MongoLocalUrl;
var mongoLiveUrl = "mongodb+srv://aps_database:arunps94@cluster0.iq5mg.mongodb.net/Zenkart?retryWrites=true&w=majority"
var cors = require("cors")
var port = process.env.PORT || 8125;
const bodyParser = require('body-parser');

//save the database connection
var db

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => { res.send("This is a request for zenkart api") })

app.get('/category', (req, res) => {
    db.collection('Product_Category').find({}, { projection: { _id: 0 } }).toArray((err, result) => {
        if (err) throw err;
        res.send(result);
    })
})




app.post('/addProducts', (req, res) => {
    console.log(req.body)
    db.collection('newProducts').insert(req.body, (err, result) => {
        if (err) throw err
        //    res.send("new product added successfully")
        return res.send(result);
    })


})

app.put('/updateProduct/:id', (req, res) => {
    var id = Number(req.params.id);
    db.collection('newProducts').update({ product_id: id }, {
        $set: {
            product_name: req.body.product_name,
            category: req.body.category,
            subCategory: req.body.subCategory,
            category_id: req.body.category_id,
            subCategory_id: req.body.subCategory_id,
            product_pricet: req.body.product_price,
            product_image: req.body.product_image,
            product_color: req.body.product_color,
            product_brand: req.body.product_brand,
            product_discription: req.body.product_discription
        }
    }, (err, result) => {
        if (err) throw err;
        // res.send('data updated')
        res.send(result)
    })

})



app.get('/products', (req, res) => {
    db.collection('newProducts').find().toArray((err, result) => {
        if (err) throw err;
        res.send(result);
    })
})

app.get('/productType', (req, res) => {
    db.collection('productType').find().toArray((err, result) => {
        if (err) throw err;
        res.send(result);
    })
})


app.get('/filter/:subCategory', (req, res) => {
    var subCategory = req.params.subCategory;
    var sort = { product_price: 1 }
    var skip = 0;
    var limit = 1000000000000
    var query = { "subCategory": subCategory };

    if (req.query.sortKey) {
        var sortKey = req.query.sortKey
        if (sortKey > 1 || sortKey < -1 || sortKey == 0) {
            sortKey = 1
        }
        sort = { product_price: Number(sortKey) }
    } else
        if (req.query.skip && req.query.limit) {
            skip = Number(req.query.skip)
            limit = Number(req.query.limit)
        } else

            if (req.query.lcost && req.query.hcost) {
                var lcost = Number(req.query.lcost);
                var hcost = Number(req.query.hcost);
                query = {
                    $and: [{ product_price: { $gt: lcost, $lt: hcost } }],
                    "subCategory": subCategory
                }
            }else if(req.query.brand){
                query = {"subCategory": subCategory,"product_brand":req.query.brand}
                
             }else if(req.query.brand && req.query.lcost && req.query.hcost){
                query = {$and:[{product_price:{$gt:lcost,$lt:hcost}}],
                "product_brand":req.query.brand,
                "subCategory": subCategory}
             }
                   db.collection('newProducts').find(query).sort(sort).skip(skip).limit(limit).toArray((err, result) => {
                        if (err) throw err;
                        res.send(result)
                        // console.log("cost",result)
                    })
                })

app.get('/subCatgory', (req, res) => {
    var query = {};
    var c = req.query.c;
    if (c) {
        query = { category_id: Number(c) }
    }
    db.collection('Product_subCatgory').find(query).toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})


app.delete('/deleteProduct/:id', (req, res) => {
    var id = Number(req.params.id);
    db.collection('newProducts').deleteOne({ product_id: id }, (err, result) => {
        if (err) throw err;
        res.send(result)
    })
})


// **********************************************FOR ORDERS*************************************
app.post('/productItem', (req, res) => {
    console.log(req.body);
    db.collection('newProducts').find({ product_id: { $in: req.body } }).toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })

})

app.get('/product/:id', (req, res) => {
    var id = parseInt(req.params.id);
    db.collection('newProducts').find({ "product_id": id }).toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})


// return all the orders
app.get('/orders', (req, res) => {
    var query = req.query.email 
    db.collection('zorders').find({email:query}).toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})


app.post('/cartOrders', (req, res) => {
    console.log(req.body)
    db.collection('zorders').insertOne(req.body, (err, result) => {
        if (err) throw err
        res.send("order placed")
    })

})

app.put('/updateStatus/:id',(req, res)=>{
    var id = Number(req.params.id);
    var status = req.body.status?req.body.status:"Pending";
<<<<<<< HEAD
    console.log(req.body);
=======
>>>>>>> 0e0499e65e29ad94b109555064ec0a5980e4fd00
    db.collection('zorders').updateOne(
        {id:id},
        {
            $set:{
                "date":req.body.date,
                "bank_status":req.body.bank_status,
                "bank":req.body.bank,
                "status":status
            }
        }
        )
        res.send("data updated")
})

app.post('/productItem',(req, res)=>{
    console.log(req.body);
    db.collection('newProducts').find({product_id:{$in:req.body}}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
  
})


app.delete('/deleteOrder', (req, res) => {
    db.collection('zorders').remove({}, (err, result) => {
        if (err) throw err;
        res.send(result)
    })
})


//connecting with mongodb
MongoClient.connect(mongoLiveUrl, (err, client) => {
    if (err) console.log("Error while connecting")
    db = client.db('Zenkart')
    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    })
})

