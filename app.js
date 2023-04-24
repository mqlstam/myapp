const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

const database = {};
let nextId = 0;
const saltRounds = 10;

const jwtSecret = 'your-secret-key';


const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const emailExists = (email) => {
  for (let id in database) {
    if (database[id].email === email) {
      return true; // e-mail is al in database
    }
  }
  return false; // e-mail is niet in database
};


app.use(bodyParser.json());

app.get('/',(req,res) => {
  res.send(database);
})

app.get('/user/:id', (req, res) => {
  const { id } = req.params;
  if (!database[id]) {
    res.status(404).send({ error: `Email with id ${id} not found` });
  } else {
    res.send(database[id]);
  }
});



app.post('/register', async (req, res) => {
  const { email, password, admin } = req.body;
  if (!validateEmail(email)) {
    res.status(400).send({ error: "Invalid email" });
  } else if (emailExists(email)) {
    res.status(409).send({ error: "Email already exists" });
  } else {
    try {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const id = nextId++;
      database[id] = { id, email, password: hashedPassword, admin: !!admin };
      res.send({ message: `Registered email ${email} with id ${id}` });
      console.log(database);
    } catch (error) {
      res.status(500).send({ error: "Internal server error" });
    }
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!validateEmail(email)) {
    res.status(400).send({ error: "Invalid email" });
  } else {
    const user = Object.values(database).find((user) => user.email === email);
    if (!user) {
      res.status(404).send({ error: "Email not found" });
    } else {
      try {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
          res.send({ message: `Logged in as ${email}`, token });
        } else {
          res.status(401).send({ error: "Incorrect password" });
        }
      } catch (error) {
        res.status(500).send({ error: "Internal server error" });
      }
    }
  }
});


const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(403).send({ error: 'No token provided' });
  }
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: 'Unauthorized!' });
    }
    req.userId = decoded.id;
    next();
  });
};



app.put('/user', (req, res) => {
  res.send('Got a PUT request at /user')
})
app.delete('/user/:id', verifyToken, (req, res) => {
  const userId = req.userId;
  const targetId = req.params.id;

  if (!database[userId]) {
    res.status(404).send({ error: `User with id ${userId} not found` });
  } else if (!database[userId].admin) {
    res.status(403).send({ error: 'You do not have permission to delete other accounts' });
  } else if (!database[targetId]) {
    res.status(404).send({ error: `User with id ${targetId} not found` });
  } else {
    const { email } = database[targetId];
    delete database[targetId];
    res.send({ message: `Deleted user ${email} with id ${targetId}` });
    console.log(database);
  }
});

app.get('/users', verifyToken, (req, res) => {
  const { active, field1, value1, field2, value2 } = req.query;
  let filteredUsers = Object.values(database);

  if (active !== undefined) {
    const isActive = active.toLowerCase() === 'true';
    filteredUsers = filteredUsers.filter((user) => user.active === isActive);
  }

  if (field1 && value1) {
    filteredUsers = filteredUsers.filter((user) => user[field1] === value1);
  }

  if (field2 && value2) {
    filteredUsers = filteredUsers.filter((user) => user[field2] === value2);
  }

  res.send(filteredUsers.map(({ id, email, admin, active }) => ({ id, email, admin, active })));
});

app.get('/api/user/profile', verifyToken, (req, res) => {
  const userId = req.userId;

  if (!database[userId]) {
    res.status(404).send({ error: `User with id ${userId} not found` });
  } else {
    // Hardcoded response since the database is not ready yet
    const userProfile = {
      id: userId,
      email: database[userId].email,
      meals: [
        {
          id: 1,
          title: "Pasta Bolognese",
          date: "2023-05-01",
          time: "18:00",
          description: "Delicious homemade pasta with Bolognese sauce",
          imageUrl: "https://example.com/pasta-bolognese.jpg",
          vegetarian: false,
          vegan: false
        },
        {
          id: 2,
          title: "Vegan Burger",
          date: "2023-05-02",
          time: "19:00",
          description: "Tasty vegan burger with fresh vegetables and homemade sauce",
          imageUrl: "https://example.com/vegan-burger.jpg",
          vegetarian: true,
          vegan: true
        }
      ]
    };

    res.send({ message: `Retrieved profile for user ${userId}`, data: userProfile });
  }
});

app.get('/api/user/:userId', verifyToken, (req, res) => {
  const requestedUserId = req.params.userId;
  const loggedInUserId = req.userId;

  if (!database[requestedUserId]) {
    res.status(404).send({ error: `User with id ${requestedUserId} not found` });
  } else {
    // Hardcoded response since the database is not ready yet
    const userDetails = {
      id: requestedUserId,
      email: database[requestedUserId].email,
      meals: [
        {
          id: 1,
          title: "Pasta Bolognese",
          date: "2023-05-01",
          time: "18:00",
          description: "Delicious homemade pasta with Bolognese sauce",
          imageUrl: "https://example.com/pasta-bolognese.jpg",
          vegetarian: false,
          vegan: false
        },
        {
          id: 2,
          title: "Vegan Burger",
          date: "2023-05-02",
          time: "19:00",
          description: "Tasty vegan burger with fresh vegetables and homemade sauce",
          imageUrl: "https://example.com/vegan-burger.jpg",
          vegetarian: true,
          vegan: true
        }
      ]
    };

    if (requestedUserId === loggedInUserId) {
      userDetails.password = database[requestedUserId].password;
    }

    res.send({ message: `Retrieved details for user ${requestedUserId}`, data: userDetails });
  }
});




app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});