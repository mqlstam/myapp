const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;
const database = {
  users: {
    0: {
      id: 0,
      email: 'admin@example.com',
      password: '$2b$10$RQyQ2uDff8TQG2QjKzOnZuVf.9/8pWJ7vMnTdD6s7Yqs8FpDBx7o6', // Password is 'admin123'
      admin: true,
    },
    1: {
      id: 1,
      email: 'jane.doe@example.com',
      password: '$2b$10$RQyQ2uDff8TQG2QjKzOnZuVf.9/8pWJ7vMnTdD6s7Yqs8FpDBx7o6', // Password is 'password123'
      admin: false,
    },
    2: {
      id: 2,
      email: 'john.doe@example.com',
      password: '$2b$10$RQyQ2uDff8TQG2QjKzOnZuVf.9/8pWJ7vMnTdD6s7Yqs8FpDBx7o6', // Password is 'password123'
      admin: false,
    },
    3: {
      id: 3,
      email: 'test@example.com',
      password: '$2b$10$RQyQ2uDff8TQG2QjKzOnZuVf.9/8pWJ7vMnTdD6s7Yqs8FpDBx7o6', // Password is 'test123'
      admin: false,
    },
  },

meals: {},
};
let nextUserId = 0;
let nextMealId = 0;
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
  for (let id in database.users) {
    if (database.users[id].email === email) {
      return true;
    }
  }
  return false;
};

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send(database);
});

app.get('/user/:id', (req, res) => {
  const { id } = req.params;
  if (!database.users[id]) {
    res.status(404).send({ error: `User with id ${id} not found` });
  } else {
    res.send(database.users[id]);
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
      const id = nextUserId++;
      database.users[id] = { id, email, password: hashedPassword, admin: !!admin };
      res.send({ message: `Registered email ${email} with id ${id}` });
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
    const user = Object.values(database.users).find((user) => user.email === email);
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
  const token = req.headers['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjgxOTA1NDI1LCJleHAiOjE2ODE5MDkwMjV9.O-4ipeH7ZMBrcI-TfGUqN-RdKlXJTYTpVX_TDkjzvW8'];
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
  res.send('Got a PUT request at /user');
  });
  
  app.delete('/user/:id', verifyToken, (req, res) => {
  const userId = req.userId;
  const targetId = req.params.id;
  
  if (!database.users[userId]) {
    res.status(404).send({ error: `User with id ${userId} not found` });

  } else if (!database.users[userId].admin) {
  res.status(403).send({ error: 'You do not have permission to delete other accounts' });
  } else if (!database.users[targetId]) {
    res.status(404).send({ error: `User with id ${targetId} not found` });

  } else {
  const { email } = database.users[targetId];
  delete database.users[targetId];
  res.send({ message: `Deleted user ${email} with id ${targetId}` });

  }
  });
  
  app.get('/users', verifyToken, (req, res) => {
  const { active, field1, value1, field2, value2 } = req.query;
  let filteredUsers = Object.values(database.users);
  
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
  
  res.send(filteredUsers.map(({ id, email, admin }) => ({ id, email, admin })));
  });
  
  app.get('/api/user/profile', verifyToken, (req, res) => {
  const userId = req.userId;
  
  if (!database.users[userId]) {
    res.status(404).send({ error: `User with id ${userId} not found` });
  } else {
  const userProfile = {
  id: userId,
  email: database.users[userId].email,
  meals: Object.values(database.meals).filter((meal) => meal.userId === userId),
  };
  res.send({ message: `Retrieved profile for user ${userId}`, data: userProfile });
}
});

app.get('/api/user/:userId', verifyToken, (req, res) => {
  const requestedUserId = req.params.userId;
  const loggedInUserId = req.userId;
  
  if (!database.users[requestedUserId]) {
    res.status(404).send({ error: `User with id ${requestedUserId} not found` });
  } else {
  const userDetails = {
  id: requestedUserId,
  email: database.users[requestedUserId].email,
  meals: Object.values(database.meals).filter((meal) => meal.userId === requestedUserId),
  };
  if (requestedUserId === loggedInUserId) {
  userDetails.password = database.users[requestedUserId].password;
  }
  res.send({ message: `Retrieved details for user ${requestedUserId}`, data: userDetails });

}
});

app.put('/api/user/:userId', verifyToken, (req, res) => {
const requestedUserId = req.params.userId;
const loggedInUserId = req.userId;


res.send({ message: `Retrieved details for user ${requestedUserId}`, data: userDetails });

});

app.put('/api/user/:userId', verifyToken, (req, res) => {
const requestedUserId = req.params.userId;
const loggedInUserId = req.userId;
if (!database.users[requestedUserId]) {
  res.status(404).send({ error: `User with id ${requestedUserId} not found` });
} else if (requestedUserId !== loggedInUserId) {
  res.status(403).send({ error: 'You are not allowed to update this user data' });
  } else {
  // Validate the input data
  const { email, phoneNumber } = req.body;
  if (!email) {
    res.status(400).send({ error: 'Email address is required' });
  } else if (!isValidPhoneNumber(phoneNumber)) {
    res.status(400).send({ error: 'Phone number is not valid' });
  } else {
    database.users[requestedUserId].email = email;
    database.users[requestedUserId].phoneNumber = phoneNumber;
  
    res.send({ message: `Updated details for user ${requestedUserId}`, data: database.users[requestedUserId] });
  }
}
});

function isValidPhoneNumber(phoneNumber) {
// Add your phone number validation logic here
// This is a simple example that checks if the phone number is 10 digits long
return phoneNumber && phoneNumber.length === 10;
}

app.delete('/api/user/:userId', verifyToken, (req, res) => {
const requestedUserId = req.params.userId;
const loggedInUserId = req.userId;
if (!database.users[requestedUserId]) {
  res.status(404).send({ error: `User with id ${requestedUserId} not found` });
} else if (requestedUserId !== loggedInUserId) {
res.status(403).send({ error: 'You are not allowed to delete this user data' });
} else {
delete database.users[requestedUserId];
res.send({ message: `User with ID ${requestedUserId} has been deleted` });
}
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}


module.exports = app;
