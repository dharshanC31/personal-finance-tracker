import express from 'express'; import cors from 'cors'; import dotenv from 'dotenv';
import { initializeDatabase } from './db/database.js';
import { getCategories, createCategory, getTransactions, createTransaction, deleteTransaction, getCategoryById } from './db/queries.js';
dotenv.config(); const app = express(); const PORT = process.env.PORT || 3000;
// CORS_ORIGIN: comma separated list of allowed frontend URLs. Empty means allow all (fine for local dev).
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined)); app.use(express.json());
app.get('/api/health', (req, res) => res.json({ success: true, message: "API is running" }));
app.get('/api/categories', async (req, res, next) => { try { res.json({ success: true, data: await getCategories() }); } catch(e){ next(e); } });
app.post('/api/categories', async (req, res, next) => {
  try {
    const { name, type } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) return res.status(400).json({ success: false, error: 'Name required.' });
    if (!['income', 'expense'].includes(type)) return res.status(400).json({ success: false, error: 'Type invalid.' });
    res.status(201).json({ success: true, data: await createCategory({ name: name.trim(), type }) });
  } catch(e) { if (e.message?.includes('UNIQUE')) return res.status(409).json({ success: false, error: 'Category already exists.' }); next(e); }
});
app.get('/api/transactions', async (req, res, next) => {
  try {
    const { startDate, endDate, categoryId } = req.query;
    res.json({ success: true, data: await getTransactions({ startDate, endDate, categoryId: categoryId ? Number(categoryId) : undefined }) });
  } catch(e){ next(e); }
});
app.post('/api/transactions', async (req, res, next) => {
  try {
    const { amount, description, date, categoryId } = req.body;
    if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ success: false, error: 'Amount must be > 0.' });
    if (!date || isNaN(Date.parse(date))) return res.status(400).json({ success: false, error: 'Valid date required.' });
    if (!categoryId || !(await getCategoryById(Number(categoryId)))) return res.status(400).json({ success: false, error: 'Valid categoryId required.' });
    res.status(201).json({ success: true, data: await createTransaction({ amount, description: description?.trim() || '', date, categoryId: Number(categoryId) }) });
  } catch(e){ next(e); }
});
app.delete('/api/transactions/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteTransaction(id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Transaction not found.' });
    res.json({ success: true, data: { id } });
  } catch(e){ next(e); }
});
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ success: false, error: 'Internal Server Error' }); });
await initializeDatabase();
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));