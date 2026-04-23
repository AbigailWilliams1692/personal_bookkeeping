import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-view-records',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-records.component.html',
  styleUrl: './view-records.component.css'
})
export class ViewRecordsComponent {
  private transactionService = inject(TransactionService);

  readonly transactions = this.transactionService.allTransactions;

  formatAmount(amount: number, currency: string): string {
    const symbol = this.transactionService.getCurrencySymbol(currency);
    return `${symbol}${amount.toFixed(2)}`;
  }

  deleteTransaction(id: number): void {
    if (confirm('确定要删除这条记录吗？')) {
      this.transactionService.deleteTransactionById(id);
    }
  }
}
