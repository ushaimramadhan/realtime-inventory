import express from 'express';
import { getProducts, createProduct } from '../controllers/productController';
import { createTransaction } from '../controllers/transactionController';

const router = express.Router();

router.get('/products', getProducts);
router.post('/products', createProduct);
router.post('/transaction', createTransaction);

export default router;