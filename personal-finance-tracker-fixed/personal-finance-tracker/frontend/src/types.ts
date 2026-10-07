export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
}

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  categoryId: number;
  categoryName: string;
  categoryType: 'income' | 'expense';
  createdAt: string;
}
