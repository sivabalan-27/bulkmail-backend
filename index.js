const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(
  "mongodb+srv://siva:1234@cluster0.vdvb74x.mongodb.net/passkey?appName=Cluster0",
  { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ Connection Failed:", err));

// ✅ Define schema & model for credentials
const credentialSchema = new mongoose.Schema({
  user: String,
  pass: String
}, { collection: 'bulkmail' });

const Credential = mongoose.model('Credential', credentialSchema);

// ✅ Email sending route
app.post('/sendemail', async (req, res) => {
  const { msg, emailList } = req.body;

  // Validate request
  if (!msg || !emailList || !Array.isArray(emailList) || emailList.length === 0) {
    return res.status(400).send("❌ Bad request: msg and emailList are required");
  }

  try {
    // Fetch the first credential document
    const credential = await Credential.findOne();
    if (!credential) {
      return res.status(400).send("❌ No credentials found");
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: credential.user,
        pass: credential.pass,
      },
    });

    for (const email of emailList) {
      await transporter.sendMail({
        from: credential.user,
        to: email,
        subject: 'Bulk Mail',
        text: msg,
      });
    }

    console.log("✅ All emails sent successfully");
    res.send(true);

  } catch (error) {
    console.error("❌ Email send error:", error);
    res.status(500).send(false);
  }
});

app.listen(3000, () => console.log('🚀 Server running on port 3000'));
