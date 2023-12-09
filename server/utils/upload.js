import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import mongoose from 'mongoose';

const storage = new GridFsStorage({
    url: process.env.DB_URL,
    options: { useNewUrlParser: true },
    file: (request, file) => {
        const match = ["image/png", "image/jpg"];

        if (match.indexOf(file.memeType) === -1)
            return `${Date.now()}-blog-${file.originalname}`;

        return {
            bucketName: "photos",
            filename: `${Date.now()}-blog-${file.originalname}`
        };
    }
});

const upload = multer({ storage });

// Establish MongoDB connection
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to the database');
        // Start your Express server or use the upload middleware as needed
    })
    .catch((err) => {
        console.error('Error connecting to the database:', err);
    });

export default upload;
