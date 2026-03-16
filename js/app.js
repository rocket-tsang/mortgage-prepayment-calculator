/**
 * 房贷提前还款计算器 - 应用入口
 * 主应用逻辑
 */

class MortgageApp {
    constructor() {
        this.formHandler = null;
        this.resultRenderer = null;
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        // 初始化表单处理器
        this.formHandler = new FormHandler('calculatorForm');

        // 初始化结果渲染器
        this.resultRenderer = new ResultRenderer('resultSection', 'resultContent');

        // 绑定表单提交事件
        this._bindFormSubmit();

        console.log('房贷计算器已初始化');
    }

    /**
     * 绑定表单提交事件
     * @private
     */
    _bindFormSubmit() {
        const form = document.getElementById('calculatorForm');

        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this._handleSubmit();
        });
    }

    /**
     * 处理表单提交
     * @private
     */
    _handleSubmit() {
        // 清除之前的错误
        this.formHandler.clearErrors();

        // 验证表单
        if (!this.formHandler.validate()) {
            // 滚动到第一个错误位置
            const firstError = document.querySelector('.has-error');
            if (firstError) {
                Utils.scrollTo(firstError, { block: 'center' });
            }
            return;
        }

        // 获取表单数据
        const params = this.formHandler.getFormData();

        // 执行计算
        const result = MortgageCalculator.calculate(params);

        // 渲染结果
        this.resultRenderer.render(result, params);

        // 打印调试信息
        console.log('计算参数:', params);
        console.log('计算结果:', result);
    }

    /**
     * 重置应用
     */
    reset() {
        this.formHandler?.reset();
        this.resultRenderer?.hide();
    }
}

// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 创建全局应用实例
    window.mortgageApp = new MortgageApp();
});

// 暴露ResultRenderer静态方法供HTML使用
window.ResultRenderer = ResultRenderer;

// 导出（如果是模块环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MortgageApp, MortgageCalculator, FormHandler, ResultRenderer, Utils };
}
