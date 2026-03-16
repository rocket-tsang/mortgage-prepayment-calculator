/**
 * 房贷计算器核心引擎
 * 实现等额本息和等额本金两种还款方式的计算
 */

class MortgageCalculator {

    /**
     * 等额本息计算
     * @param {Object} params - 计算参数
     * @param {number} params.loanAmount - 贷款金额（元）
     * @param {number} params.annualRate - 年利率（%）
     * @param {number} params.loanTermMonths - 贷款期限（月）
     * @param {number} params.paidMonths - 已还款期数
     * @param {number} params.prepaymentAmount - 提前还款金额（元）
     * @param {string} params.prepaymentType - 提前还款方式：reduce_payment(期限不变) / shorten_term(月供不变)
     * @returns {Object} 计算结果
     */
    static calculateEqualPayment(params) {
        const {
            loanAmount,
            annualRate,
            loanTermMonths,
            paidMonths,
            prepaymentAmount,
            prepaymentType
        } = params;

        // 月利率
        const monthlyRate = annualRate / 100 / 12;
        const totalMonths = loanTermMonths;
        const remainingMonths = totalMonths - paidMonths;

        // 1. 计算原月供
        // 公式: A = P * i * (1 + i)^N / ((1 + i)^N - 1)
        const originalMonthlyPayment = this._calculateMonthlyPayment(
            loanAmount,
            monthlyRate,
            totalMonths
        );

        // 2. 计算剩余本金（已还k期后）
        // 公式: P_remain = P * (1 + i)^k - A * ((1 + i)^k - 1) / i
        const remainingPrincipal = this._calculateRemainingPrincipal(
            loanAmount,
            monthlyRate,
            paidMonths,
            originalMonthlyPayment
        );

        // 验证：提前还款金额不能超过剩余本金
        if (prepaymentAmount >= remainingPrincipal) {
            return {
                error: '提前还款金额不能超过或等于剩余本金'
            };
        }

        // 3. 扣除提前还款
        const newPrincipal = remainingPrincipal - prepaymentAmount;

        let result = {
            method: 'equal_payment',
            originalMonthlyPayment,
            remainingPrincipal,
            newPrincipal,
            remainingMonthsBefore: remainingMonths
        };

        if (prepaymentType === 'reduce_payment') {
            // 方式一：期限不变，减少月供
            result.newMonthlyPayment = this._calculateMonthlyPayment(
                newPrincipal,
                monthlyRate,
                remainingMonths
            );
            result.newRemainingMonths = remainingMonths;
            result.monthlySavings = originalMonthlyPayment - result.newMonthlyPayment;

            // 计算节省利息
            // 原计划剩余利息
            const originalRemainingInterest = originalMonthlyPayment * remainingMonths - remainingPrincipal;
            // 新计划剩余利息
            const newRemainingInterest = result.newMonthlyPayment * remainingMonths - newPrincipal;
            result.savedInterest = originalRemainingInterest - newRemainingInterest;

        } else {
            // 方式二：月供不变，缩短期限
            result.newMonthlyPayment = originalMonthlyPayment;
            // 通过迭代求解新期限
            result.newRemainingMonths = this._solveTerm(
                newPrincipal,
                monthlyRate,
                originalMonthlyPayment
            );
            result.monthlySavings = 0;
            result.shortenedMonths = remainingMonths - result.newRemainingMonths;

            // 计算节省利息
            const originalRemainingInterest = originalMonthlyPayment * remainingMonths - remainingPrincipal;
            const newRemainingInterest = originalMonthlyPayment * result.newRemainingMonths - newPrincipal;
            result.savedInterest = originalRemainingInterest - newRemainingInterest;
        }

        // 添加原始总利息信息
        const originalTotalInterest = originalMonthlyPayment * totalMonths - loanAmount;
        result.originalTotalInterest = originalTotalInterest;

        return result;
    }

    /**
     * 等额本金计算
     * @param {Object} params - 计算参数
     * @returns {Object} 计算结果
     */
    static calculateEqualPrincipal(params) {
        const {
            loanAmount,
            annualRate,
            loanTermMonths,
            paidMonths,
            prepaymentAmount,
            prepaymentType
        } = params;

        // 月利率
        const monthlyRate = annualRate / 100 / 12;
        const totalMonths = loanTermMonths;
        const remainingMonths = totalMonths - paidMonths;

        // 1. 每月偿还本金
        const monthlyPrincipal = loanAmount / totalMonths;

        // 2. 剩余本金
        const remainingPrincipal = loanAmount - paidMonths * monthlyPrincipal;

        // 验证：提前还款金额不能超过剩余本金
        if (prepaymentAmount >= remainingPrincipal) {
            return {
                error: '提前还款金额不能超过或等于剩余本金'
            };
        }

        // 3. 新剩余本金
        const newPrincipal = remainingPrincipal - prepaymentAmount;

        // 4. 计算原计划当期月供（第paidMonths+1期的月供）
        const currentMonthPrincipal = monthlyPrincipal;
        const currentMonthInterest = (loanAmount - paidMonths * monthlyPrincipal) * monthlyRate;
        const currentMonthPayment = currentMonthPrincipal + currentMonthInterest;

        let result = {
            method: 'equal_principal',
            originalMonthlyPayment: currentMonthPayment,
            remainingPrincipal,
            newPrincipal,
            remainingMonthsBefore: remainingMonths
        };

        if (prepaymentType === 'reduce_payment') {
            // 方式一：期限不变，重算月供
            const newMonthlyPrincipal = newPrincipal / remainingMonths;
            const firstMonthInterest = newPrincipal * monthlyRate;
            result.newMonthlyPayment = newMonthlyPrincipal + firstMonthInterest;
            result.newRemainingMonths = remainingMonths;
            result.monthlySavings = currentMonthPayment - result.newMonthlyPayment;

            // 简化利息计算（估算）
            // 原计划剩余利息
            const originalRemainingInterest = this._calculateEqualPrincipalRemainingInterest(
                remainingPrincipal,
                monthlyPrincipal,
                monthlyRate,
                remainingMonths
            );
            // 新计划剩余利息
            const newMonthlyPrincipalNew = newPrincipal / remainingMonths;
            const newRemainingInterest = this._calculateEqualPrincipalRemainingInterest(
                newPrincipal,
                newMonthlyPrincipalNew,
                monthlyRate,
                remainingMonths
            );
            result.savedInterest = originalRemainingInterest - newRemainingInterest;

        } else {
            // 方式二：缩短期限
            // 保持每月本金不变，计算新期限
            const newMonthlyPrincipal = monthlyPrincipal;
            result.newRemainingMonths = Math.ceil(newPrincipal / newMonthlyPrincipal);

            // 计算首期新月供
            const firstMonthInterest = newPrincipal * monthlyRate;
            result.newMonthlyPayment = newMonthlyPrincipal + firstMonthInterest;
            result.shortenedMonths = remainingMonths - result.newRemainingMonths;
            result.monthlySavings = 0;

            // 简化利息计算
            const originalRemainingInterest = this._calculateEqualPrincipalRemainingInterest(
                remainingPrincipal,
                monthlyPrincipal,
                monthlyRate,
                remainingMonths
            );
            const newRemainingInterest = this._calculateEqualPrincipalRemainingInterest(
                newPrincipal,
                newMonthlyPrincipal,
                monthlyRate,
                result.newRemainingMonths
            );
            result.savedInterest = originalRemainingInterest - newRemainingInterest;
        }

        return result;
    }

    /**
     * 计算等额本息月供
     * @private
     */
    static _calculateMonthlyPayment(principal, monthlyRate, months) {
        if (monthlyRate === 0) {
            return principal / months;
        }
        const factor = Math.pow(1 + monthlyRate, months);
        return principal * monthlyRate * factor / (factor - 1);
    }

    /**
     * 计算等额本息剩余本金
     * @private
     */
    static _calculateRemainingPrincipal(principal, monthlyRate, paidMonths, monthlyPayment) {
        if (monthlyRate === 0) {
            return principal - monthlyPayment * paidMonths;
        }
        const factor = Math.pow(1 + monthlyRate, paidMonths);
        return principal * factor - monthlyPayment * (factor - 1) / monthlyRate;
    }

    /**
     * 求解新的还款期限（二分迭代法）
     * 已知：本金、月利率、目标月供，求需要多少期还清
     * @private
     */
    static _solveTerm(principal, monthlyRate, targetPayment) {
        if (monthlyRate === 0) {
            return Math.ceil(principal / targetPayment);
        }

        // 使用二分查找求解
        let low = 1, high = 360; // 1-360个月
        for (let i = 0; i < 50; i++) {
            const mid = Math.floor((low + high) / 2);
            const testPayment = this._calculateMonthlyPayment(principal, monthlyRate, mid);

            if (testPayment > targetPayment) {
                // 期限太短，月供太高
                low = mid + 1;
            } else {
                high = mid - 1;
            }

            if (low >= high) break;
        }

        return Math.ceil(low);
    }

    /**
     * 计算等额本金剩余利息
     * @private
     */
    static _calculateEqualPrincipalRemainingInterest(principal, monthlyPrincipal, monthlyRate, months) {
        let totalInterest = 0;
        let remainingPrincipal = principal;
        for (let i = 0; i < months; i++) {
            totalInterest += remainingPrincipal * monthlyRate;
            remainingPrincipal -= monthlyPrincipal;
        }
        return totalInterest;
    }

    /**
     * 主入口：根据还款方式调用相应的计算方法
     * @param {Object} params - 计算参数
     * @param {string} params.repaymentType - 还款方式：equal_payment(等额本息) / equal_principal(等额本金)
     * @returns {Object} 计算结果
     */
    static calculate(params) {
        // 参数预处理
        const processedParams = {
            ...params,
            loanAmount: parseFloat(params.loanAmount) || 0,
            annualRate: parseFloat(params.annualRate) || 0,
            loanTermMonths: parseInt(params.loanTermMonths) || 0,
            paidMonths: parseInt(params.paidMonths) || 0,
            prepaymentAmount: parseFloat(params.prepaymentAmount) || 0
        };

        // 基础验证
        if (processedParams.loanAmount <= 0) {
            return { error: '贷款金额必须大于0' };
        }
        if (processedParams.annualRate <= 0) {
            return { error: '年利率必须大于0' };
        }
        if (processedParams.loanTermMonths <= 0) {
            return { error: '贷款期限必须大于0' };
        }
        if (processedParams.paidMonths < 0) {
            return { error: '已还款期数不能为负数' };
        }
        if (processedParams.paidMonths >= processedParams.loanTermMonths) {
            return { error: '已还款期数不能超过或等于贷款期限' };
        }
        if (processedParams.prepaymentAmount <= 0) {
            return { error: '提前还款金额必须大于0' };
        }

        // 根据还款方式选择计算方法
        if (processedParams.repaymentType === 'equal_payment') {
            return this.calculateEqualPayment(processedParams);
        } else if (processedParams.repaymentType === 'equal_principal') {
            return this.calculateEqualPrincipal(processedParams);
        } else {
            return { error: '不支持的还款方式' };
        }
    }

    /**
     * 格式化金额显示
     * @param {number} amount - 金额
     * @returns {string} 格式化后的金额
     */
    static formatMoney(amount) {
        return '¥' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * 格式化月份显示
     * @param {number} months - 月数
     * @returns {string} 格式化后的时间
     */
    static formatMonths(months) {
        const years = Math.floor(months / 12);
        const remainMonths = months % 12;
        if (years > 0 && remainMonths > 0) {
            return `${years}年${remainMonths}个月`;
        } else if (years > 0) {
            return `${years}年`;
        }
        return `${remainMonths}个月`;
    }
}

// 导出（如果是模块环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MortgageCalculator;
}
