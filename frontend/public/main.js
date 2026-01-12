// 导入配置文件
import { currencies } from './currencies.js';
import { transactionTypes } from './types.js';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 标签页切换功能
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有活动状态
            navLinks.forEach(nav => nav.parentElement.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // 添加当前活动状态
            this.parentElement.classList.add('active');
            const targetTab = this.getAttribute('data-tab');
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // 设置默认日期为今天
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('date').value = formattedDate;
    document.getElementById('date').min = '2000-01-01';
    document.getElementById('date').max = '2100-12-31';
    
    // 货币选择变化时更新货币符号
    const currencySelect = document.getElementById('currency');
    const currencySymbol = document.getElementById('currencySymbol');
    
    currencySelect.addEventListener('change', function() {
        updateCurrencySymbol();
    });
    
    // 初始化货币符号
    updateCurrencySymbol();
    
    // 动态生成货币选项
    populateCurrencyOptions();
    
    // 动态生成类型选项
    populateTypeOptions();
    
    // 备注字数统计
    const noteTextarea = document.getElementById('note');
    const charCount = document.getElementById('charCount');
    
    noteTextarea.addEventListener('input', function() {
        charCount.textContent = this.value.length;
    });
    
    // 表单提交处理
    const transactionForm = document.getElementById('transactionForm');
    const formStatus = document.getElementById('formStatus');
    
    transactionForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // 获取表单数据
        const formData = {
            date: document.getElementById('date').value,
            amount: parseFloat(document.getElementById('amount').value),
            currency: document.getElementById('currency').value,
            type: document.getElementById('type').value,
            note: document.getElementById('note').value
        };
        
        // 验证表单
        if (!formData.date) {
            showFormStatus('请选择日期', 'error');
            return;
        }
        
        if (!formData.amount || formData.amount <= 0) {
            showFormStatus('请输入有效的金额（大于0）', 'error');
            return;
        }
        
        if (!formData.currency) {
            showFormStatus('请选择货币', 'error');
            return;
        }
        
        if (!formData.type) {
            showFormStatus('请选择类型', 'error');
            return;
        }
        
        // 模拟表单提交成功
        showFormStatus('交易记录添加成功！', 'success');
        
        // 模拟添加到预览区域
        addToPreview(formData);
        
        // 3秒后重置表单
        setTimeout(() => {
            transactionForm.reset();
            formStatus.className = 'status-message';
            formStatus.textContent = '';
            
            // 重置日期为今天
            document.getElementById('date').value = formattedDate;
            
            // 重置货币符号
            updateCurrencySymbol();
            
            // 重置字数统计
            charCount.textContent = 0;
        }, 5000);
    });
    
    // 表单重置处理
    transactionForm.addEventListener('reset', function() {
        formStatus.className = 'status-message';
        formStatus.textContent = '';
        
        // 重置日期为今天
        document.getElementById('date').value = formattedDate;
        
        // 重置货币符号
        updateCurrencySymbol();
        
        // 重置字数统计
        charCount.textContent = 0;
    });
});

// 更新货币符号
function updateCurrencySymbol() {
    const currencySelect = document.getElementById('currency');
    const currencySymbol = document.getElementById('currencySymbol');
    const selectedCurrency = currencySelect.value;
    
    const currency = currencies.find(c => c.value === selectedCurrency);
    currencySymbol.textContent = currency ? currency.symbol : '¥';
}

// 动态生成货币选项
function populateCurrencyOptions() {
    const currencySelect = document.getElementById('currency');
    
    // 清空现有选项
    currencySelect.innerHTML = '<option value="">请选择货币</option>';
    
    // 添加货币选项
    currencies.forEach(currency => {
        const option = document.createElement('option');
        option.value = currency.value;
        option.textContent = currency.label;
        // 不设置默认选中，让HTML的selected属性生效
        currencySelect.appendChild(option);
    });
}

// 动态生成类型选项
function populateTypeOptions() {
    const typeSelect = document.getElementById('type');
    
    // 清空现有选项
    typeSelect.innerHTML = '<option value="">请选择类型</option>';
    
    // 添加类型选项
    transactionTypes.forEach(group => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = group.group;
        
        group.options.forEach(type => {
            const option = document.createElement('option');
            option.value = type.value;
            option.textContent = type.label;
            optgroup.appendChild(option);
        });
        
        typeSelect.appendChild(optgroup);
    });
}

// 显示表单状态消息
function showFormStatus(message, type) {
    const formStatus = document.getElementById('formStatus');
    formStatus.textContent = message;
    formStatus.className = `status-message ${type}`;
    
    // 滚动到状态消息
    formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 模拟添加到预览区域
function addToPreview(transactionData) {
    console.log('交易数据已保存:', transactionData);
    // 在实际应用中，这里会将数据发送到后端保存
    // 并更新预览区域显示最新的交易记录
}

// 金额验证函数
function validateAmount(input) {
    const value = input.value;
    const amountHint = document.getElementById('amountHint');
    
    // 检查是否为有效数字
    if (isNaN(value) || value === '') {
        input.classList.add('invalid');
        amountHint.textContent = '请输入有效的金额';
        amountHint.style.color = '#d93025';
        return;
    }
    
    // 检查小数位数
    const decimalIndex = value.indexOf('.');
    if (decimalIndex !== -1) {
        const decimalPlaces = value.length - decimalIndex - 1;
        if (decimalPlaces > 4) {
            input.classList.add('invalid');
            amountHint.textContent = '小数位数不能超过4位';
            amountHint.style.color = '#d93025';
        } else {
            input.classList.remove('invalid');
            amountHint.textContent = '最多支持四位小数';
            amountHint.style.color = '#5f6368';
        }
    } else {
        input.classList.remove('invalid');
        amountHint.textContent = '最多支持四位小数';
        amountHint.style.color = '#5f6368';
    }
    
    // 检查是否为负数
    if (parseFloat(value) < 0) {
        input.classList.add('invalid');
        amountHint.textContent = '金额不能为负数';
        amountHint.style.color = '#d93025';
    }
}
