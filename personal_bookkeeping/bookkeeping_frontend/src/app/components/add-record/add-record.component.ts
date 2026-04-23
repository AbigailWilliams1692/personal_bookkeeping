import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { CURRENCIES, TRANSACTION_CATEGORIES, TRANSACTION_TYPES, DEFAULT_CURRENCY, Currency, TransactionCategoryGroup, Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-add-record',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-record.component.html',
  styleUrl: './add-record.component.css'
})
export class AddRecordComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private userService = inject(UserService);

  currencies: Currency[] = CURRENCIES;
  transactionCategories: TransactionCategoryGroup[] = TRANSACTION_CATEGORIES;
  transactionTypeOptions: string[] = TRANSACTION_TYPES;

  date = signal(this.getTodayDate());
  amount = signal<string>('');
  currency = signal(DEFAULT_CURRENCY);
  transactionType = signal<string>('支出');
  category = signal('');
  location = signal('');
  note = signal('');

  readonly filteredCategories = computed(() => {
    const selectedType = this.transactionType();
    const group = this.transactionCategories.find(g => g.group === selectedType);
    return group ? group.options : [];
  });

  statusMessage = signal('');
  statusType = signal<'success' | 'error' | ''>('');
  amountHint = signal('最多支持两位小数');
  amountHintColor = signal('#5f6368');
  isAmountInvalid = signal(false);

  readonly currencySymbol = computed(() => {
    return this.transactionService.getCurrencySymbol(this.currency());
  });

  readonly charCount = computed(() => {
    return this.note().length;
  });

  readonly recentTransactions = this.transactionService.recentTransactions;
  readonly queriedTransactions = this.transactionService.filteredTransactions;
  readonly isLoadingTransactions = this.transactionService.loading;

  queryStartDate = signal(this.getMonthStartDate());
  queryEndDate = signal(this.getTodayDate());

  // Sorting signals
  sortBy = signal<'id' | 'date'>('id');
  sortOrder = signal<'asc' | 'desc'>('desc');

  readonly sortedTransactions = computed(() => {
    const transactions = this.transactionService.filteredTransactions();
    const sortByField = this.sortBy();
    const order = this.sortOrder();
    
    return [...transactions].sort((a, b) => {
      let comparison = 0;
      if (sortByField === 'id') {
        comparison = (a.id ?? 0) - (b.id ?? 0);
      } else {
        comparison = a.date.localeCompare(b.date);
      }
      return order === 'asc' ? comparison : -comparison;
    });
  });

  // Edit modal signals
  showEditModal = signal(false);
  editingTransaction = signal<Transaction | null>(null);
  editDate = signal('');
  editAmount = signal<string>('');
  editCurrency = signal(DEFAULT_CURRENCY);
  editTransactionType = signal<string>('支出');
  editCategory = signal('');
  editLocation = signal('');
  editNote = signal('');
  editAmountHint = signal('最多支持两位小数');
  editAmountHintColor = signal('#5f6368');
  isEditAmountInvalid = signal(false);

  readonly editFilteredCategories = computed(() => {
    const selectedType = this.editTransactionType();
    const group = this.transactionCategories.find(g => g.group === selectedType);
    return group ? group.options : [];
  });

  readonly editCurrencySymbol = computed(() => {
    return this.transactionService.getCurrencySymbol(this.editCurrency());
  });

  readonly editCharCount = computed(() => {
    return this.editNote().length;
  });

  // Delete modal signals
  showDeleteModal = signal(false);
  deletingTransaction = signal<Transaction | null>(null);

  ngOnInit(): void {
    this.fetchTransactions();
  }

  private getMonthStartDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    // Create date at noon to avoid timezone issues
    return `${year}-${String(month + 1).padStart(2, '0')}-01`;
  }

  private getTodayDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  onCurrencyChange(value: string): void {
    this.currency.set(value);
  }

  onQueryStartDateChange(date: string): void {
    this.queryStartDate.set(date);
    this.fetchTransactions();
  }

  onQueryEndDateChange(date: string): void {
    this.queryEndDate.set(date);
    this.fetchTransactions();
  }

  fetchTransactions(): void {
    this.transactionService.fetchTransactionsByDateRange(
      this.queryStartDate(),
      this.queryEndDate()
    );
  }

  onAmountInput(input: HTMLInputElement): void {
    const value = input.value;
    this.amount.set(value);
    // Only validate on blur, not on every keystroke
  }

  onAmountBlur(input: HTMLInputElement): void {
    let value = input.value;
    
    // Clean up the value on blur
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // Format to 2 decimal places if needed
      const parts = value.split('.');
      if (parts.length > 1 && parts[1].length > 2) {
        value = numValue.toFixed(2);
        input.value = value;
      }
    }
    
    this.amount.set(value);
    this.validateAmount(value);
  }

  validateAmount(value: string): void {
    this.isAmountInvalid.set(false);
    this.amountHint.set(''); // Clear hint by default

    if (value === '') {
      this.amountHint.set('金额不能为空');
      this.amountHintColor.set('#d93025');
      this.isAmountInvalid.set(true);
      return;
    }

    // Check if it's a valid decimal number (only digits and one decimal point)
    const decimalPattern = /^\-?\d*\.?\d*$/;
    if (!decimalPattern.test(value)) {
      this.isAmountInvalid.set(true);
      this.amountHint.set('请输入有效的数字');
      this.amountHintColor.set('#d93025');
      return;
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      this.isAmountInvalid.set(true);
      this.amountHint.set('请输入有效的金额');
      this.amountHintColor.set('#d93025');
      return;
    }

    if (numValue < 0) {
      this.isAmountInvalid.set(true);
      this.amountHint.set('金额不能为负数');
      this.amountHintColor.set('#d93025');
      return;
    }

    // Valid input - show default hint
    this.amountHint.set('最多支持两位小数');
    this.amountHintColor.set('#5f6368');
  }

  onSubmit(): void {
    console.log('onSubmit called');
    console.log('date:', this.date());
    console.log('amount:', this.amount());
    console.log('currency:', this.currency());
    console.log('transactionType:', this.transactionType());
    console.log('category:', this.category());

    if (!this.date()) {
      this.showStatus('请选择日期', 'error');
      return;
    }

    if (!this.amount() || parseFloat(this.amount()) <= 0) {
      this.showStatus('请输入有效的金额（大于0）', 'error');
      return;
    }

    if (!this.currency()) {
      this.showStatus('请选择货币', 'error');
      return;
    }

    if (!this.transactionType()) {
      this.showStatus('请选择交易类型', 'error');
      return;
    }

    if (!this.category()) {
      this.showStatus('请选择类别', 'error');
      return;
    }

    this.transactionService.addTransaction(
      {
        user: this.userService.getUsername(),
        date: this.date(),
        amount: parseFloat(this.amount()),
        currency: this.currency(),
        type: this.transactionType(),
        category: this.category(),
        location: this.location(),
        note: this.note()
      },
      () => {
        console.log('Transaction saved to database');
        this.showStatus('交易记录添加成功！', 'success');
        this.fetchTransactions();
        setTimeout(() => {
          this.resetForm();
        }, 3000);
      },
      (error) => {
        console.error('Failed to save transaction:', error);
        this.showStatus('添加失败: ' + error, 'error');
      }
    );
  }

  resetForm(): void {
    this.date.set(this.getTodayDate());
    this.amount.set('');
    this.currency.set(DEFAULT_CURRENCY);
    this.transactionType.set('支出');
    this.category.set('');
    this.location.set('');
    this.note.set('');
    this.statusMessage.set('');
    this.statusType.set('');
    this.amountHint.set('最多支持两位小数');
    this.amountHintColor.set('#5f6368');
    this.isAmountInvalid.set(false);
  }

  onTransactionTypeChange(): void {
    this.category.set('');
  }

  private showStatus(message: string, type: 'success' | 'error'): void {
    this.statusMessage.set(message);
    this.statusType.set(type);
  }

  formatAmount(amount: number, currency: string): string {
    const symbol = this.transactionService.getCurrencySymbol(currency);
    return `${symbol}${amount.toFixed(2)}`;
  }

  // Sorting Methods
  toggleSortBy(): void {
    this.sortBy.update(current => current === 'id' ? 'date' : 'id');
  }

  toggleSortOrder(): void {
    this.sortOrder.update(current => current === 'asc' ? 'desc' : 'asc');
  }

  // CSV Bulk Upload Methods
  onCsvFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    if (!file.name.endsWith('.csv')) {
      this.showStatus('请选择CSV文件', 'error');
      input.value = '';
      return;
    }

    // Try reading as UTF-8 first, then fall back to GBK if headers don't match
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      // Check if headers are readable (contains expected Chinese characters)
      const firstLine = content.split('\n')[0];
      if (firstLine.includes('日期') || firstLine.includes('用户')) {
        this.processCsvContent(content, input);
      } else {
        // Try reading as GBK
        this.readFileAsGBK(file, input);
      }
    };
    reader.onerror = () => {
      this.showStatus('文件读取失败', 'error');
      input.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  }

  private readFileAsGBK(file: File, fileInput: HTMLInputElement): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      try {
        const decoder = new TextDecoder('gbk');
        const content = decoder.decode(arrayBuffer);
        this.processCsvContent(content, fileInput);
      } catch (err) {
        this.showStatus('文件编码不支持，请使用UTF-8编码', 'error');
        fileInput.value = '';
      }
    };
    reader.onerror = () => {
      this.showStatus('文件读取失败', 'error');
      fileInput.value = '';
    };
    reader.readAsArrayBuffer(file);
  }

  private processCsvContent(content: string, fileInput: HTMLInputElement): void {
    // Remove BOM if present (UTF-8 BOM: \uFEFF)
    let cleanContent = content;
    if (cleanContent.charCodeAt(0) === 0xFEFF) {
      cleanContent = cleanContent.slice(1);
    }
    
    const lines = cleanContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      this.showStatus('CSV文件至少需要包含标题行和一条记录', 'error');
      fileInput.value = '';
      return;
    }

    const headers = this.parseCsvLine(lines[0]).map(h => h.trim());
    const expectedHeaders = ['用户', '日期', '收支', '类别', '金额', '货币', '去向/来源', '备注'];
    
    // Validate headers
    const headerMapping: { [key: string]: string } = {
      '用户': 'user',
      '日期': 'transaction_date',
      '收支': 'transaction_type',
      '类别': 'transaction_category',
      '金额': 'amount',
      '货币': 'currency',
      '去向/来源': 'site',
      '备注': 'comment'
    };

    // Check required headers exist
    const requiredHeaders = ['日期', '收支', '类别', '金额'];
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        this.showStatus(`CSV文件缺少必要列: ${required}`, 'error');
        fileInput.value = '';
        return;
      }
    }

    // Parse records
    const transactions: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      if (values.length === 0 || values.every(v => !v.trim())) {
        continue; // Skip empty lines
      }

      const record: any = {};
      headers.forEach((header, index) => {
        const fieldName = headerMapping[header];
        if (fieldName && values[index] !== undefined) {
          record[fieldName] = values[index].trim();
        }
      });

      // Convert date format from YYYY/M/D to YYYY-MM-DD
      if (record.transaction_date) {
        record.transaction_date = this.convertDateFormat(record.transaction_date);
      }

      // Convert amount to number
      if (record.amount) {
        record.amount = parseFloat(record.amount);
        if (isNaN(record.amount)) {
          this.showStatus(`第${i + 1}行金额格式错误`, 'error');
          fileInput.value = '';
          return;
        }
      }

      // Set default user if not provided
      if (!record.user) {
        record.user = this.userService.getUsername();
      }

      // Set default currency if not provided
      if (!record.currency) {
        record.currency = 'HKD';
      }

      transactions.push(record);
    }

    if (transactions.length === 0) {
      this.showStatus('CSV文件中没有有效的交易记录', 'error');
      fileInput.value = '';
      return;
    }

    // Call service to bulk upload
    this.transactionService.bulkAddTransactions(
      transactions,
      () => {
        this.showStatus(`成功导入 ${transactions.length} 条交易记录！`, 'success');
        this.transactionService.fetchTransactionsByDateRange(this.queryStartDate(), this.queryEndDate());
      },
      (error) => {
        this.showStatus(`导入失败: ${error}`, 'error');
      }
    );

    fileInput.value = '';
  }

  private parseCsvLine(line: string): string[] {
    // Remove carriage return if present
    const cleanLine = line.replace(/\r/g, '');
    
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < cleanLine.length; i++) {
      const char = cleanLine[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  private convertDateFormat(dateStr: string): string {
    // Handle formats like YYYY/M/D or YYYY-M-D
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  }

  // CSV Export Method
  exportToCsv(): void {
    const transactions = this.sortedTransactions();
    if (transactions.length === 0) {
      this.showStatus('没有可导出的交易记录', 'error');
      return;
    }

    // CSV headers matching sample_transaction.csv format
    const headers = ['用户', '日期', '收支', '类别', '金额', '货币', '去向/来源', '备注'];
    
    // Build CSV content
    const csvLines: string[] = [headers.join(',')];
    
    for (const txn of transactions) {
      const row = [
        this.escapeCsvField(txn.user || ''),
        this.escapeCsvField(txn.date.replace(/-/g, '/')),
        this.escapeCsvField(txn.type),
        this.escapeCsvField(txn.category),
        txn.amount.toString(),
        this.escapeCsvField(txn.currency),
        this.escapeCsvField(txn.location || ''),
        this.escapeCsvField(txn.note || '')
      ];
      csvLines.push(row.join(','));
    }
    
    const csvContent = csvLines.join('\n');
    
    // Create blob with UTF-8 BOM for proper Chinese character display in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    
    // Generate filename with date range
    const filename = `transactions_${this.queryStartDate()}_${this.queryEndDate()}.csv`;
    
    // Trigger download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    this.showStatus(`已导出 ${transactions.length} 条交易记录`, 'success');
  }

  private escapeCsvField(value: string): string {
    // If field contains comma, newline, or quote, wrap in quotes and escape existing quotes
    if (value.includes(',') || value.includes('\n') || value.includes('"')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  // Edit Modal Methods
  openEditModal(txn: Transaction): void {
    this.editingTransaction.set(txn);
    this.editDate.set(txn.date);
    this.editAmount.set(txn.amount.toString());
    this.editCurrency.set(txn.currency);
    this.editTransactionType.set(txn.type);
    this.editCategory.set(txn.category);
    this.editLocation.set(txn.location || '');
    this.editNote.set(txn.note || '');
    this.editAmountHint.set('最多支持两位小数');
    this.editAmountHintColor.set('#5f6368');
    this.isEditAmountInvalid.set(false);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingTransaction.set(null);
  }

  onEditAmountInput(input: HTMLInputElement): void {
    const value = input.value;
    this.editAmount.set(value);
  }

  onEditAmountBlur(input: HTMLInputElement): void {
    let value = input.value;
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const parts = value.split('.');
      if (parts.length > 1 && parts[1].length > 2) {
        value = numValue.toFixed(2);
        input.value = value;
      }
    }
    this.editAmount.set(value);
    this.validateEditAmount(value);
  }

  validateEditAmount(value: string): void {
    this.isEditAmountInvalid.set(false);
    this.editAmountHint.set('');

    if (value === '') {
      this.editAmountHint.set('金额不能为空');
      this.editAmountHintColor.set('#d93025');
      this.isEditAmountInvalid.set(true);
      return;
    }

    const decimalPattern = /^\d*\.?\d*$/;
    if (!decimalPattern.test(value)) {
      this.isEditAmountInvalid.set(true);
      this.editAmountHint.set('请输入有效的数字');
      this.editAmountHintColor.set('#d93025');
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      this.isEditAmountInvalid.set(true);
      this.editAmountHint.set('请输入有效的金额');
      this.editAmountHintColor.set('#d93025');
      return;
    }

    if (numValue < 0) {
      this.isEditAmountInvalid.set(true);
      this.editAmountHint.set('金额不能为负数');
      this.editAmountHintColor.set('#d93025');
      return;
    }

    this.editAmountHint.set('最多支持两位小数');
    this.editAmountHintColor.set('#5f6368');
  }

  onEditTransactionTypeChange(): void {
    this.editCategory.set('');
  }

  onEditCurrencyChange(value: string): void {
    this.editCurrency.set(value);
  }

  submitEdit(): void {
    const txn = this.editingTransaction();
    if (!txn || txn.id === undefined) return;

    if (!this.editDate()) {
      this.showStatus('请选择日期', 'error');
      return;
    }

    if (!this.editAmount() || parseFloat(this.editAmount()) <= 0) {
      this.showStatus('请输入有效的金额（大于0）', 'error');
      return;
    }

    if (!this.editCurrency()) {
      this.showStatus('请选择货币', 'error');
      return;
    }

    if (!this.editTransactionType()) {
      this.showStatus('请选择交易类型', 'error');
      return;
    }

    if (!this.editCategory()) {
      this.showStatus('请选择类别', 'error');
      return;
    }

    this.transactionService.updateTransaction(
      txn.id!,
      {
        user: this.userService.getUsername(),
        date: this.editDate(),
        amount: parseFloat(this.editAmount()),
        currency: this.editCurrency(),
        type: this.editTransactionType(),
        category: this.editCategory(),
        location: this.editLocation(),
        note: this.editNote()
      },
      () => {
        this.showStatus('交易记录修改成功！', 'success');
        this.closeEditModal();
        this.fetchTransactions();
      },
      (error) => {
        this.showStatus('修改失败: ' + error, 'error');
      }
    );
  }

  // Delete Modal Methods
  openDeleteModal(txn: Transaction): void {
    this.deletingTransaction.set(txn);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deletingTransaction.set(null);
  }

  confirmDelete(): void {
    const txn = this.deletingTransaction();
    if (!txn || txn.id === undefined) return;

    this.transactionService.deleteTransactionById(
      txn.id!,
      () => {
        this.showStatus('交易记录删除成功！', 'success');
        this.closeDeleteModal();
        this.fetchTransactions();
      },
      (error) => {
        this.showStatus('删除失败: ' + error, 'error');
      }
    );
  }
}
