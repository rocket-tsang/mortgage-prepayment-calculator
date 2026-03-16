/**
 * 表单交互逻辑
 * 处理表单输入、验证、数据收集
 */

class FormHandler {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.termUnit = 'year'; // year 或 month
        this.init();
    }

    /**
     * 初始化表单
     */
    init() {
        if (!this.form) {
            console.error('表单元素不存在');
            return;
        }

        this._initTermToggle();
        this._initRadioGroups();
        this._initInputValidation();
    }

    /**
     * 初始化期限单位切换
     * @private
     */
    _initTermToggle() {
        const toggleGroup = document.getElementById('termUnitToggle');
        const loanTermInput = document.getElementById('loanTerm');
        const termUnitDisplay = document.getElementById('termUnitDisplay');

        if (!toggleGroup || !loanTermInput || !termUnitDisplay) return;

        const buttons = toggleGroup.querySelectorAll('.toggle-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.dataset.value;

                // 更新按钮状态
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // 更新单位
                this.termUnit = value;
                termUnitDisplay.textContent = value === 'year' ? '年' : '月';

                // 更新输入框属性
                if (value === 'year') {
                    loanTermInput.max = 30;
                    loanTermInput.placeholder = '请输入贷款期限（年）';
                    // 如果当前值过大，转换为年
                    if (parseInt(loanTermInput.value) > 30) {
                        loanTermInput.value = Math.round(parseInt(loanTermInput.value) / 12);
                    }
                } else {
                    loanTermInput.max = 360;
                    loanTermInput.placeholder = '请输入贷款期限（月）';
                    // 如果当前值较小，转换为月
                    if (parseInt(loanTermInput.value) <= 30) {
                        loanTermInput.value = parseInt(loanTermInput.value) * 12;
                    }
                }

                // 触发验证
                this._validateInput(loanTermInput);
            });
        });
    }

    /**
     * 初始化单选按钮组
     * @private
     */
    _initRadioGroups() {
        // 还款方式选择
        const repaymentTypeGroup = document.getElementById('repaymentTypeGroup');
        const repaymentTypeInput = document.getElementById('repaymentType');

        if (repaymentTypeGroup && repaymentTypeInput) {
            const items = repaymentTypeGroup.querySelectorAll('.radio-item');

            items.forEach(item => {
                item.addEventListener('click', () => {
                    const value = item.dataset.value;

                    // 更新选中状态
                    items.forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');

                    // 更新隐藏输入框的值
                    repaymentTypeInput.value = value;
                });
            });
        }

        // 提前还款方式选择
        const prepaymentTypeGroup = document.getElementById('prepaymentTypeGroup');
        const prepaymentTypeInput = document.getElementById('prepaymentType');

        if (prepaymentTypeGroup && prepaymentTypeInput) {
            const items = prepaymentTypeGroup.querySelectorAll('.radio-item');

            items.forEach(item => {
                item.addEventListener('click', () => {
                    const value = item.dataset.value;

                    // 更新选中状态
                    items.forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');

                    // 更新隐藏输入框的值
                    prepaymentTypeInput.value = value;
                });
            });
        }
    }

    /**
     * 初始化输入验证
     * @private
     */
    _initInputValidation() {
        const inputs = this.form.querySelectorAll('input[type="number"]');

        inputs.forEach(input => {
            // 输入时清除错误
            input.addEventListener('input', () => {
                Utils.clearError(input);
            });

            // 失去焦点时验证
            input.addEventListener('blur', () => {
                this._validateInput(input);
            });
        });
    }

    /**
     * 验证单个输入框
     * @private
     */
    _validateInput(input) {
        const rules = this._getValidationRules(input.id);
        if (!rules) return true;

        const result = Utils.validateNumber(input.value, rules);

        if (!result.valid) {
            Utils.showError(input, result.message);
            return false;
        }

        // 特殊验证：已还款期数不能超过贷款期限
        if (input.id === 'paidMonths') {
            const loanTermInput = document.getElementById('loanTerm');
            const paidMonths = parseInt(input.value) || 0;
            const loanTerm = this._getLoanTermInMonths();

            if (paidMonths >= loanTerm) {
                Utils.showError(input, '已还款期数不能超过或等于贷款期限');
                return false;
            }
        }

        // 特殊验证：提前还款金额
        if (input.id === 'prepaymentAmount') {
            const amount = parseFloat(input.value) || 0;
            if (amount < 10000) {
                Utils.showError(input, '提前还款金额不能少于1万元');
                return false;
            }
        }

        return true;
    }

    /**
     * 获取验证规则
     * @private
     */
    _getValidationRules(inputId) {
        const rules = {
            loanAmount: {
                positive: true,
                min: 10000,
                max: 10000000,
                minMessage: '贷款金额不能少于1万元',
                maxMessage: '贷款金额不能超过1000万元'
            },
            interestRate: {
                positive: true,
                min: 0.1,
                max: 20,
                minMessage: '年利率不能低于0.1%',
                maxMessage: '年利率不能高于20%'
            },
            loanTerm: {
                positive: true,
                integer: true
            },
            paidMonths: {
                nonNegative: true,
                integer: true
            },
            prepaymentAmount: {
                positive: true,
                integer: true
            }
        };

        return rules[inputId];
    }

    /**
     * 获取贷款期限（转换为月数）
     * @returns {number} 贷款期限（月）
     * @private
     */
    _getLoanTermInMonths() {
        const loanTermInput = document.getElementById('loanTerm');
        const value = parseInt(loanTermInput?.value) || 0;
        return this.termUnit === 'year' ? value * 12 : value;
    }

    /**
     * 验证整个表单
     * @returns {boolean} 是否验证通过
     */
    validate() {
        let isValid = true;
        const inputs = this.form.querySelectorAll('input[type="number"]');

        inputs.forEach(input => {
            if (!this._validateInput(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * 获取表单数据
     * @returns {Object} 表单数据
     */
    getFormData() {
        const data = {
            loanAmount: parseFloat(document.getElementById('loanAmount').value) || 0,
            annualRate: parseFloat(document.getElementById('interestRate').value) || 0,
            loanTermMonths: this._getLoanTermInMonths(),
            paidMonths: parseInt(document.getElementById('paidMonths').value) || 0,
            prepaymentAmount: parseFloat(document.getElementById('prepaymentAmount').value) || 0,
            repaymentType: document.getElementById('repaymentType').value,
            prepaymentType: document.getElementById('prepaymentType').value
        };

        return data;
    }

    /**
     * 清除所有错误
     */
    clearErrors() {
        Utils.clearAllErrors(this.form);
    }

    /**
     * 重置表单
     */
    reset() {
        this.form.reset();
        this.clearErrors();

        // 重置单选按钮状态
        document.querySelectorAll('.radio-item').forEach((item, index) => {
            if (index === 0) {
                item.classList.add('selected');
            } else {
                const group = item.closest('.radio-group');
                if (group && group.querySelector('.radio-item:first-child') === item) {
                    item.classList.add('selected');
                } else {
                    item.classList.remove('selected');
                }
            }
        });

        // 重置还款方式选择
        const repaymentTypeItems = document.querySelectorAll('#repaymentTypeGroup .radio-item');
        repaymentTypeItems.forEach((item, index) => {
            if (index === 0) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        document.getElementById('repaymentType').value = 'equal_payment';

        // 重置提前还款方式选择
        const prepaymentTypeItems = document.querySelectorAll('#prepaymentTypeGroup .radio-item');
        prepaymentTypeItems.forEach((item, index) => {
            if (index === 0) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        document.getElementById('prepaymentType').value = 'reduce_payment';

        // 重置期限单位
        const toggleBtns = document.querySelectorAll('#termUnitToggle .toggle-btn');
        toggleBtns.forEach(btn => btn.classList.remove('active'));
        toggleBtns[0]?.classList.add('active');
        this.termUnit = 'year';
        document.getElementById('termUnitDisplay').textContent = '年';
    }
}
