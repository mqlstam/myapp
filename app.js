const express = require('express');
const app = express();
const port = 3000;

app.get('/',(req,res) => {
    res.send({"text":"Hello World!"});
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
app.post('/', (req, res) => {
  res.send('Got a POST request')
})
app.put('/user', (req, res) => {
  res.send('Got a PUT request at /user')
})
app.delete('/user', (req, res) => {
  res.send('Got a DELETE request at /user')
})