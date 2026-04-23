import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent {
  private transactionService = inject(TransactionService);

  readonly statistics = this.transactionService.statistics;

  getCurrencySymbol(currency: string): string {
    return this.transactionService.getCurrencySymbol(currency);
  }

  getTypeEntries(): { type: string; amount: number }[] {
    const byType = this.statistics().byType;
    return Object.entries(byType).map(([type, amount]) => ({ type, amount }));
  }

  getCurrencyEntries(): { currency: string; income: number; expense: number }[] {
    const byCurrency = this.statistics().byCurrency;
    return Object.entries(byCurrency).map(([currency, data]) => ({
      currency,
      income: data.income,
      expense: data.expense
    }));
  }
}
