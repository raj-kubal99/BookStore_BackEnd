const express = require('express');
const cors = require('cors');
const { SCHEMA } = require('sqlite3');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 8080;


// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());


// DB FUNCTIONS
// Connect to SQLite database
function connectDB(){
  const db = new sqlite3.Database('./mydatabase.db', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
  });
  return db;
}

// Disconnect from SQLite database
function closeDB(db){
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Closed the database connection.');
  });
}

// Add Order Details into Tables
function storeOrderDetails(db,req){
  const orderItems = req.body.cartItems;
  const subtotal = req.body.Amount;
  const bookQTY = orderItems.reduce((acc, obj) => acc + obj.quantity, 0);
  //console.log(orderItems,subtotal,bookQTY);
  db.run(`INSERT INTO Orders(bookQTY, subTotal) Values(${bookQTY}, ${subtotal})`, (err) => {
    if (err) {
      console.log(err.message);
    }
    else{
      db.get("SELECT orderID FROM Orders ORDER BY orderID DESC LIMIT 1;", (err, rows) => {
        if (rows) {
          const order_id = rows.orderID;

          orderItems.forEach(item => {
            const prodprice = parseFloat(item.quantity)*parseFloat(item.price);
            db.run(`INSERT INTO OrderedProducts(orderID,bookid,bookQTY,price) Values(${order_id}, ${item.id}, ${item.quantity}, ${prodprice})`, (err) => {
              if (err) {
                throw new Error(err.message);
              }

            });
      
          });
          
        }
      });    
    }
  });
  
  return "success";
  
}

//ROUTES
// Route to get all users
app.get('/books', (req, res) => {
  const db = connectDB();
  const parameter = req.query.parameter;
  const pattern = req.query.pattern;
  let dbquery;
  if (pattern===''){
    dbquery=`SELECT * FROM Books ORDER BY ${parameter}`
    db.all(`SELECT * FROM Books ORDER BY ${parameter}`, (err, rows) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ data: rows });
    });
  }else{
    dbquery = `SELECT * FROM Books WHERE ${parameter} LIKE "%${pattern}% ORDER BY INSTR(${parameter},"${pattern}")`
    db.all(`SELECT * FROM Books WHERE ${parameter} LIKE "%${pattern}% ORDER BY INSTR(${parameter},"${pattern}")`, (err, rows) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ data: rows });
    });
  }
  console.log(dbquery);
  closeDB(db);
});

//select * from Books where author Like "%an%" order by INSTR(author, "an");

// Route to get a specific user by ID
app.get('/productinfo/:id', (req, res) => {
  const db = connectDB();
  const id = parseInt(req.params.id);
  db.all(`select * from Books,BookDetails where Books.id=Bookdetails.id and Books.id=${id}`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
  closeDB(db);
});

// Route to Store Order Details
app.post('/order', (req, res) => {
  try{
    const db = connectDB();
    const result = storeOrderDetails(db,req);
    closeDB(db);
    res.status(201).json(result);
  }catch(error){
    res.status(409).json({ error: 'Conflict' });
  }
  
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
