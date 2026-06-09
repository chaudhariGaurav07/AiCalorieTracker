import multer from 'multer';
import { storage } from '../config/cloudinary.js';

export const upload = multer({ storage });
