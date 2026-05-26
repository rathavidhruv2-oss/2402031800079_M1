const express = require('express')
const app = express()

app.listen(3000, () => {
    console.log('Successfully started server on port 3000')
})

app.set('view engine', 'ejs')

app.get ('/', (req, res) => {
    res.jsonp({name: "Dhruv", age: 20});
})

app.get('/about', (req, res) => {       
    res.redirect('..');

}) 

app.get('/user', (req, res) => {
    res.render('user')
});
