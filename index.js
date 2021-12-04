const express = require('express')
const jwt = require('jsonwebtoken');
const app = express();
const server = require('http').createServer(app);
const port = process.env.PORT || 3000;
const io = require('socket.io')(server);
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.user,
  host: process.env.host,
  database: process.env.database,
  password: process.env.password,
  port: process.env.port
})

app.use(cors({
  origin: ['http://localhost:4200']
}));

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Server'
  })
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the API'
  });
});

app.post('/api/login', express.json(), (req, res) => {
  const user = {
    username: req.body.username,
    password: req.body.password
  }
  pool.query("SELECT * FROM table2", function (err, result, fields) {
    if (err) throw err;
    if (result.rows.some(e => e.username === user.username)) {
      const userCredentials = result.rows.filter(e => e.username === user.username)
      if(userCredentials[0].password === user.password) {
        jwt.sign({user: user}, 'secretkey', { expiresIn: '30m' }, (err, token) => {
          res.json({
            token,
            request: req.body,
          });
        });
      } else {
        res.status(400).send({ message: 'Wrong Credentials' });
      }
    } else {
      res.status(400).send({ message: 'Wrong Credentials' });
    }
  });
});

// app.post('/api/login', express.json(), (req, res) => {
//   const user = {
//     username: req.body.username,
//     password: req.body.password
//   }
//   if(user.username === 'anum'){
//     jwt.sign({user: user}, 'secretkey', { expiresIn: '30m' }, (err, token) => {
//                 res.json({
//                   token,
//                   request: req.body,
//                 });
//               });
//   }
//   else {
//     res.status(400).send( {message: 'Wrong Credentials'} )
//   }
// })

app.post('/api/signup', express.json(), (req, res) => {
  console.log(req.body)
  const username = req.body.username;
  const password = req.body.password;
    pool.query('INSERT INTO table2 (username, password) VALUES ($1, $2)', [username, password], (error, results) => {
      if (error) {
        throw error
      }
      res.json({
          message: "User Created"
      });
    });
});

app.post('/api/post', verifyToken, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      res.json({
        message: 'Post Created...',
        authData
      });
    }
  });
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if(typeof bearerHeader === 'undefined') {
    res.sendStatus(403);
  }
  else {
    const bearerToken = bearerHeader.split(' ')[1];
    req.token = bearerToken;
    next();
  }
}

app.use(express.static(path.join(__dirname + '/public')))

io.on('connection', socket => {
    socket.on('chat', message => {
      io.emit('chat', message)
    });
  });
  
// server.listen(port, () => {
//   console.log(`Server running on port: ${port}`);
// });

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app;