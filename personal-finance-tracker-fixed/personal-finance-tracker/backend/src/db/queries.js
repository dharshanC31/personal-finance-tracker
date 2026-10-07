import { getDatabase } from './database.js';
export async function getCategories() { const db = await getDatabase(); return db.all('SELECT id, name, type FROM categories ORDER BY name ASC'); }
export async function getCategoryById(id) { const db = await getDatabase(); return db.get('SELECT id, name, type FROM categories WHERE id = ?', [id]); }
export async function createCategory({ name, type }) { const db = await getDatabase(); const res = await db.run('INSERT INTO categories (name, type) VALUES (?, ?)', [name, type]); return getCategoryById(res.lastID); }
export async function getTransactions({ startDate, endDate, categoryId } = {}) {
  const db = await getDatabase();
  let query = `SELECT t.id, t.amount, t.description, t.date, t.category_id AS categoryId, c.name AS categoryName, c.type AS categoryType, t.created_at AS createdAt FROM transactions t JOIN categories c ON t.category_id = c.id WHERE 1=1`;
  const params = [];
  if (startDate) { query += ' AND t.date >= ?'; params.push(startDate); }
  if (endDate) { query += ' AND t.date <= ?'; params.push(endDate); }
  if (categoryId) { query += ' AND t.category_id = ?'; params.push(categoryId); }
  query += ' ORDER BY t.date DESC, t.id DESC';
  return db.all(query, params);
}
export async function getTransactionById(id) { const db = await getDatabase(); return db.get(`SELECT t.id, t.amount, t.description, t.date, t.category_id AS categoryId, c.name AS categoryName, c.type AS categoryType, t.created_at AS createdAt FROM transactions t JOIN categories c ON t.category_id = c.id WHERE t.id = ?`, [id]); }
export async function createTransaction({ amount, description, date, categoryId }) { const db = await getDatabase(); const res = await db.run('INSERT INTO transactions (amount, description, date, category_id) VALUES (?, ?, ?, ?)', [amount, description, date, categoryId]); return getTransactionById(res.lastID); }
export async function deleteTransaction(id) { const db = await getDatabase(); const res = await db.run('DELETE FROM transactions WHERE id = ?', [id]); return res.changes > 0; }