/**
 * 工具函数库
 */

const Utils = {

    /**
     * 格式化金额显示
     * @param {number} amount - 金额
     * @param {boolean} withSymbol - 是否包含货币符号
     * @returns {string} 格式化后的金额
     */
    formatMoney(amount, withSymbol = true) {
        const formatted = Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        if (withSymbol) {
            return (amount < 0 ? '-' : '') + '¥' + formatted;
        }
        return formatted;
    },

    /**
     * 格式化百分比
     * @param {number} value - 数值
     * @param {number} decimals - 小数位数
     * @returns {string} 格式化后的百分比
     */
    formatPercent(value, decimals = 2) {
        return value.toFixed(decimals) + '%';
    },

    /**
     * 格式化月份显示
     * @param {number} months - 月数
     * @returns {string} 格式化后的时间
     */
    formatMonths(months) {
        const years = Math.floor(months / 12);
        const remainMonths = months % 12;
        if (years > 0 && remainMonths > 0) {
            return `${years}年${remainMonths}个月`;
        } else if (years > 0) {
            return `${years}年`;
        }
        return `${remainMonths}个月`;
    },

    /**
     * 验证数字输入
     * @param {string} value - 输入值
     * @param {Object} rules - 验证规则
     * @returns {Object} 验证结果 { valid: boolean, message: string }
     */
    validateNumber(value, rules = {}) {
        const num = parseFloat(value);

        // 检查是否为数字
        if (isNaN(num)) {
            return { valid: false, message: '请输入有效的数字' };
        }

        // 检查最小值
        if (rules.min !== undefined && num < rules.min) {
            return { valid: false, message: rules.minMessage || `不能小于${rules.min}` };
        }

        // 检查最大值
        if (rules.max !== undefined && num > rules.max) {
            return { valid: false, message: rules.maxMessage || `不能大于${rules.max}` };
        }

        // 检查是否为正数
        if (rules.positive && num <= 0) {
            return { valid: false, message: '必须大于0' };
        }

        // 检查是否为非负数
        if (rules.nonNegative && num < 0) {
            return { valid: false, message: '不能为负数' };
        }

        // 检查是否为整数
        if (rules.integer && !Number.isInteger(num)) {
            return { valid: false, message: '必须为整数' };
        }

        return { valid: true };
    },

    /**
     * 防抖函数
     * @param {Function} func - 要执行的函数
     * @param {number} delay - 延迟时间（毫秒）
     * @returns {Function} 防抖后的函数
     */
    debounce(func, delay = 300) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    },

    /**
     * 节流函数
     * @param {Function} func - 要执行的函数
     * @param {number} delay - 延迟时间（毫秒）
     * @returns {Function} 节流后的函数
     */
    throttle(func, delay = 300) {
        let lastTime = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastTime >= delay) {
                lastTime = now;
                func.apply(this, args);
            }
        };
    },

    /**
     * 深度克隆对象
     * @param {*} obj - 要克隆的对象
     * @returns {*} 克隆后的对象
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    },

    /**
     * 滚动到元素
     * @param {string|HTMLElement} selector - 选择器或元素
     * @param {Object} options - 选项
     */
    scrollTo(selector, options = {}) {
        const element = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector;

        if (!element) return;

        const defaultOptions = {
            behavior: 'smooth',
            block: 'start'
        };

        element.scrollIntoView({ ...defaultOptions, ...options });
    },

    /**
     * 显示/隐藏加载状态
     * @param {HTMLElement} element - 按钮/表单元素
     * @param {boolean} loading - 是否加载中
     * @param {string} originalText - 原始文本
     */
    setLoading(element, loading, originalText = '') {
        if (loading) {
            element.dataset.originalText = element.textContent;
            element.disabled = true;
            element.textContent = '计算中...';
        } else {
            element.disabled = false;
            element.textContent = element.dataset.originalText || originalText;
        }
    },

    /**
     * 解析表单数据
     * @param {HTMLFormElement} form - 表单元素
     * @returns {Object} 表单数据对象
     */
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};

        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        // 处理未在FormData中的隐藏字段
        const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
        hiddenInputs.forEach(input => {
            data[input.name] = input.value;
        });

        return data;
    },

    /**
     * 显示错误消息
     * @param {HTMLElement} input - 输入框元素
     * @param {string} message - 错误消息
     */
    showError(input, message) {
        const wrapper = input.closest('.input-wrapper') || input.closest('.form-group');
        const errorEl = wrapper?.querySelector('.error-message');

        if (wrapper) {
            wrapper.classList.add('has-error');
        }

        if (errorEl && message) {
            errorEl.textContent = message;
        }
    },

    /**
     * 清除错误消息
     * @param {HTMLElement} input - 输入框元素
     */
    clearError(input) {
        const wrapper = input.closest('.input-wrapper') || input.closest('.form-group');
        const errorEl = wrapper?.querySelector('.error-message');

        if (wrapper) {
            wrapper.classList.remove('has-error');
        }

        if (errorEl) {
            errorEl.textContent = '';
        }
    },

    /**
     * 清除所有错误消息
     * @param {HTMLFormElement} form - 表单元素
     */
    clearAllErrors(form) {
        form.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
        form.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    }
};

// 导出（如果是模块环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
