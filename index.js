const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/contact-app';
    // modern mongoose/mongodb driver no longer needs these options
    const connect = await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
    return connect;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
 
const Contact = require('./models/Contact');

// routes
app.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().lean();
    res.render('home', { contacts });
  } catch (err) {
    console.error(err);
    res.render('home', { contacts: [] });
  }
});

app.get('/showcontact/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).lean();
    if (!contact) return res.redirect('/');
    res.render('show-contact', { contact });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

app.get('/addcontact', (req, res) => { res.render('addcontact'); });

app.post('/addcontact', async (req, res) => {
  try {
    await Contact.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
    });
    res.redirect('/?msg=' + encodeURIComponent('Contact created') + '&type=success');
  } catch (err) {
    console.error(err);
    res.redirect('/addcontact?msg=' + encodeURIComponent('Create failed') + '&type=danger');
  }
});

app.get('/updatecontact/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).lean();
    if (!contact) return res.redirect('/');
    res.render('update-contact', { contact });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

app.post('/updatecontact/:id', async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
    });
    res.redirect('/?msg=' + encodeURIComponent('Contact updated') + '&type=success');
  } catch (err) {
    console.error(err);
    res.redirect(`/updatecontact/${req.params.id}?msg=${encodeURIComponent('Update failed')}&type=danger`);
  }
});

app.get('/deletecontact/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.redirect('/?msg=' + encodeURIComponent('Contact deleted') + '&type=success');
  } catch (err) {
    console.error(err);
    res.redirect('/?msg=' + encodeURIComponent('Delete failed') + '&type=danger');
  }
});

// start server after DB connect
connectDB().then(() => {
  app.listen(5000, () => {
    console.log('Server is running on port 5000');
  });
}).catch(err => {
  console.error('Failed to connect to DB', err);
});