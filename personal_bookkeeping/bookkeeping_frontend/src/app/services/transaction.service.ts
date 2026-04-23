import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Transaction, CURRENCIES, INCOME_TYPES } from '../models/transaction.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private transactions = signal<Transaction[]>([]);
  private queriedTransactions = signal<Transaction[]>([]);
  private idCounter = signal(1);
  private isLoading = signal(false);

  readonly allTransactions = this.transactions.asReadonly();
  readonly filteredTransactions = this.queriedTransactions.asReadonly();
  readonly loading = this.isLoading.asReadonly();

  readonly recentTransactions = computed(() => {
    return this.transactions().slice(-5).reverse();
  });

  fetchTransactionsByDateRange(startDate: string, endDate: string): void {
    this.isLoading.set(true);
    const url = `/api/transactions/transactions?start_date=${startDate}&end_date=${endDate}`;
    
    this.http.get<{ success: boolean; data: any[] }>(url).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const transactions: Transaction[] = response.data.map(item => ({
            id: item.id,
            user: item.user,
            date: item.transaction_date,
            amount: item.amount,
            currency: item.currency,
            type: item.transaction_type,
            category: item.transaction_category,
            location: item.site,
            note: item.comment
          }));
          this.queriedTransactions.set(transactions);
        } else {
          this.queriedTransactions.set([]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
        this.queriedTransactions.set([]);
        this.isLoading.set(false);
      }
    });
  }

  readonly statistics = computed(() => {
    const txns = this.transactions();
    if (txns.length === 0) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: 0,
        byCurrency: {} as Record<string, { income: number; expense: number }>,
        byType: {} as Record<string, number>
      };
    }

    let totalIncome = 0;
    let totalExpense = 0;
    const byCurrency: Record<string, { income: number; expense: number }> = {};
    const byType: Record<string, number> = {};

    txns.forEach(txn => {
      const amount = txn.amount;
      const currency = txn.currency;
      const type = txn.type;

      if (!byCurrency[currency]) {
        byCurrency[currency] = { income: 0, expense: 0 };
      }

      if (INCOME_TYPES.includes(type)) {
        totalIncome += amount;
        byCurrency[currency].income += amount;
      } else {
        totalExpense += amount;
        byCurrency[currency].expense += amount;
      }

      if (!byType[type]) {
        byType[type] = 0;
      }
      byType[type] += amount;
    });

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: txns.length,
      byCurrency,
      byType
    };
  });

  addTransaction(
    transaction: Omit<Transaction, 'id' | 'createdAt'>,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ): void {
    const payload = {
      user: this.userService.getUsername(),
      transaction_date: transaction.date,
      amount: transaction.amount,
      currency: transaction.currency,
      transaction_type: transaction.type,
      transaction_category: transaction.category,
      site: transaction.location || '',
      comment: transaction.note || ''
    };

    this.http.post<{ success: boolean; data: any; message: string }>(
      '/api/transactions/transactions',
      payload
    ).subscribe({
      next: (response) => {
        if (response.success) {
          const newTransaction: Transaction = {
            id: response.data.id,
            user: this.userService.getUsername(),
            date: transaction.date,
            amount: transaction.amount,
            currency: transaction.currency,
            type: transaction.type,
            category: transaction.category,
            location: transaction.location,
            note: transaction.note,
            createdAt: new Date().toISOString()
          };
          this.transactions.update(txns => [...txns, newTransaction]);
          if (onSuccess) onSuccess();
        } else {
          if (onError) onError(response.message || 'Failed to add transaction');
        }
      },
      error: (err) => {
        console.error('Error adding transaction:', err);
        if (onError) onError(err.error?.message || 'Failed to add transaction');
      }
    });
  }

  updateTransaction(
    id: number,
    transaction: Omit<Transaction, 'id' | 'createdAt'>,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ): void {
    const payload = {
      user: this.userService.getUsername(),
      transaction_date: transaction.date,
      amount: transaction.amount,
      currency: transaction.currency,
      transaction_type: transaction.type,
      transaction_category: transaction.category,
      site: transaction.location || '',
      comment: transaction.note || ''
    };

    this.http.put<{ success: boolean; data: any; message: string }>(
      `/api/transactions/transactions/${id}`,
      payload
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.queriedTransactions.update(txns => 
            txns.map(t => t.id === id ? { ...t, ...transaction } : t)
          );
          if (onSuccess) onSuccess();
        } else {
          if (onError) onError(response.message || 'Failed to update transaction');
        }
      },
      error: (err) => {
        console.error('Error updating transaction:', err);
        if (onError) onError(err.error?.message || 'Failed to update transaction');
      }
    });
  }

  deleteTransactionById(
    id: number,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ): void {
    this.http.delete<{ success: boolean; message: string }>(
      `/api/transactions/transactions/${id}`
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.queriedTransactions.update(txns => txns.filter(t => t.id !== id));
          if (onSuccess) onSuccess();
        } else {
          if (onError) onError(response.message || 'Failed to delete transaction');
        }
      },
      error: (err) => {
        console.error('Error deleting transaction:', err);
        if (onError) onError(err.error?.message || 'Failed to delete transaction');
      }
    });
  }

  bulkAddTransactions(
    transactions: any[],
    onSuccess?: () => void,
    onError?: (error: string) => void
  ): void {
    this.http.post<{ success: boolean; data: any; message: string }>(
      '/api/transactions/transactions/batch',
      { transactions }
    ).subscribe({
      next: (response) => {
        if (response.success) {
          if (onSuccess) onSuccess();
        } else {
          if (onError) onError(response.message || 'Failed to bulk add transactions');
        }
      },
      error: (err) => {
        console.error('Error bulk adding transactions:', err);
        if (onError) onError(err.error?.message || err.error?.error || 'Failed to bulk add transactions');
      }
    });
  }

  getCurrencySymbol(currencyCode: string): string {
    const currency = CURRENCIES.find(c => c.value === currencyCode);
    return currency ? currency.symbol : '¥';
  }
}
