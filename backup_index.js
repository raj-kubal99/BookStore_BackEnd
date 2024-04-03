const express = require('express');
const app = express();
const PORT = 8080;

// Sample data
const users = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
];

// Middleware to parse JSON bodies
app.use(express.json());

// Route to get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Route to get a specific user by ID
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found');
  res.json(user);
});

// Route to create a new user
app.post('/api/users', (req, res) => {
  const user = {
    id: users.length + 1,
    name: req.body.name
  };
  console.log(req);
  users.push(user);
  res.status(201).json(user);
});

// Route to update an existing user
app.put('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found');

  user.name = req.body.name;
  res.json(user);
});

// Route to delete a user
app.delete('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).send('User not found');

  users.splice(index, 1);
  res.send('User deleted successfully');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});