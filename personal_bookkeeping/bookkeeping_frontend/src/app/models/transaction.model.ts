export interface Transaction {
  id?: number;
  user: string;
  date: string;
  amount: number;
  currency: string;
  type: string;
  category: string;
  location?: string;
  note?: string;
  createdAt?: string;
}

export interface Currency {
  value: string;
  label: string;
  symbol: string;
}

export interface TransactionCategoryOption {
  value: string;
  label: string;
}

export interface TransactionCategoryGroup {
  group: string;
  options: TransactionCategoryOption[];
}

export const CURRENCIES: Currency[] = [
  { value: 'CNY', label: '人民币 (CNY)', symbol: '¥' },
  { value: 'USD', label: '美元 (USD)', symbol: '$' },
  { value: 'HKD', label: '港币 (HKD)', symbol: 'HK$' },
  { value: 'EUR', label: '欧元 (EUR)', symbol: '€' },
  { value: 'JPY', label: '日元 (JPY)', symbol: '¥' },
  { value: 'GBP', label: '英镑 (GBP)', symbol: '£' },
  { value: 'AUD', label: '澳元 (AUD)', symbol: 'A$' },
  { value: 'CAD', label: '加元 (CAD)', symbol: 'C$' }
];

export const TRANSACTION_TYPES: string[] = ['支出', '收入'];

export const TRANSACTION_CATEGORIES: TransactionCategoryGroup[] = [
  {
    group: '支出',
    options: [
      { value: '餐饮', label: '餐饮' },
      { value: '交通', label: '交通' },
      { value: '杂货', label: '杂货' },
      { value: '网购', label: '网购' },
      { value: '软件', label: '软件' },
      { value: '住房', label: '住房' },
      { value: '租房', label: '租房' },
      { value: '娱乐', label: '娱乐' },
      { value: '医疗', label: '医疗' },
      { value: '教育', label: '教育' },
      { value: '购物', label: '购物' },
      { value: '金融', label: '金融' },
      { value: '社交', label: '社交' },
      { value: '公用事业', label: '公用事业' },
      { value: '其他支出', label: '其他支出' }
    ]
  },
  {
    group: '收入',
    options: [
      { value: '工资', label: '工资' },
      { value: '奖金', label: '奖金' },
      { value: '金融', label: '金融' },
      { value: '兼职', label: '兼职' },
      { value: '赠与', label: '赠与' },
      { value: '保险', label: '保险' },
      { value: '其他收入', label: '其他收入' }
    ]
  }
];

export const INCOME_TYPES: string[] = ['工资', '奖金', '金融', '兼职', '赠与', '保险', '其他收入'];

export const INCOME_TYPES_IND: string[] = TRANSACTION_CATEGORIES.find(group => group.group === '收入')?.options.map(option => option.value) || [];

export const DEFAULT_CURRENCY: string = 'HKD';
