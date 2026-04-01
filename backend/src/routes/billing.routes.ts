import { Router } from 'express';
import { getInvoices, getInvoiceById, createInvoice, updateInvoice, applyDiscount, collectPayment, getPayments, getReceipt } from '../controllers/billing.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.post('/invoices', createInvoice);
router.put('/invoices/:id', updateInvoice);
router.put('/invoices/:id/discount', applyDiscount);
router.get('/payments', getPayments);
router.post('/payments', collectPayment);
router.get('/payments/:id/receipt', getReceipt);

export default router;
