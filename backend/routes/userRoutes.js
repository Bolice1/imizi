import express from 'express';
import userControllers from '../controllers/userControllers.js'


const router = express.Router();

router.post("/register", userControllers.register);
router.post("/login",userControllers.logIn);

export default router