export const CREATE_CATEGORIES_TABLE = `CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, type TEXT NOT NULL CHECK(type IN ('income', 'expense')), created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`;
export const CREATE_TRANSACTIONS_TABLE = `CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, amount REAL NOT NULL, description TEXT, date TEXT NOT NULL, category_id INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT);`;
export const CREATE_INDEXES = `CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date); CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);`;
export const DEFAULT_CATEGORIES = [
  { name: 'Salary', type: 'income' }, { name: 'Freelance', type: 'income' }, { name: 'Investments', type: 'income' },
  { name: 'Groceries', type: 'expense' }, { name: 'Rent & Utilities', type: 'expense' }, { name: 'Dining Out', type: 'expense' },
  { name: 'Entertainment', type: 'expense' }, { name: 'Transportation', type: 'expense' }
];