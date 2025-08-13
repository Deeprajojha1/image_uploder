


import { config } from "dotenv";
config();
import express from 'express';
import mongoose from 'mongoose';
import multer  from 'multer';
import { v2 as cloudinary } from 'cloudinary'
import path from 'path';
const app=express();


// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));

// dependency for cloudinary
cloudinary.config({ 
  cloud_name: 'dh6pg1m91', 
  api_key: '116452578746385', 
  api_secret: 'vUDoEF_sEwemm492GMhAYm383fc'
});
// mongoose connection

mongoose.connect(process.env.MONGODB_URI, { dbName: "Mongodb_connection" })
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// When page is loaded, it will show the index.ejs file
app.get('/', (req, res) => {
       res.render('index.ejs',{url:null});
   });

//   disk stroage for multer
   const storage = multer.diskStorage({
//   destination:  "public/uploades", 
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix)
  }
})
const upload = multer({ storage: storage })

// mogoose model
const imageSchema= new mongoose.Schema({
       filename: String,
       public_id: String,
    url: String,

})
const Image = mongoose.model('Image', imageSchema);


// wesite:  form npm multer   take post method from multer
   
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file.path;
        if (!file) {
            return res.status(400).send('No file uploaded');
        }
        // uploader  from cloudinary
        const cloudinaryResult = await cloudinary.uploader.upload(file, {
            folder: "Node.js-17-project-2",
        });

        // Save to MongoDB
        await Image.create({
            public_id: cloudinaryResult.public_id,
            url: cloudinaryResult.secure_url
        });

        // Show the uploaded image in the ejs file
        res.render('index.ejs', { url: cloudinaryResult.secure_url });
    } catch (err) {
        res.status(500).send('Upload failed');
    }
});



const port= process.env.PORT;

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
