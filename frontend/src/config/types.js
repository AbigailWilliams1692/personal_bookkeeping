// 交易类型配置
export const transactionTypes = [
    // 支出类型
    { group: '支出', options: [
        { value: '餐饮', label: '餐饮' },
        { value: '交通', label: '交通' },
        { value: '杂货', label: '杂货' },
        { value: '软件', label: '软件' },
        { value: '住房', label: '住房' },
        { value: '娱乐', label: '娱乐' },
        { value: '医疗', label: '医疗' },
        { value: '教育', label: '教育' },
        { value: '购物', label: '购物' },
        { value: '其他支出', label: '其他支出' }
    ]
    },
    // 收入类型
    { group: '收入', options: [
        { value: '工资', label: '工资' },
        { value: '奖金', label: '奖金' },
        { value: '投资', label: '投资' },
        { value: '兼职', label: '兼职' },
        { value: '其他收入', label: '其他收入' }
    ]
    }
];
