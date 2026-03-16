/**
 * 结果渲染器
 * 负责格式化和展示计算结果
 */

class ResultRenderer {
    constructor(resultSectionId, resultContentId) {
        this.resultSection = document.getElementById(resultSectionId);
        this.resultContent = document.getElementById(resultContentId);
    }

    /**
     * 渲染结果
     * @param {Object} result - 计算结果
     * @param {Object} params - 计算参数
     */
    render(result, params) {
        if (!this.resultSection || !this.resultContent) return;

        // 检查是否有错误
        if (result.error) {
            this.renderError(result.error);
            return;
        }

        // 根据还款方式和提前还款方式渲染不同的结果
        const html = this._generateResultHTML(result, params);

        this.resultContent.innerHTML = html;
        this.show();
    }

    /**
     * 生成结果HTML
     * @private
     */
    _generateResultHTML(result, params) {
        const { prepaymentType } = params;
        const isReducePayment = prepaymentType === 'reduce_payment';

        let html = `
            <div class="result-card">
                <!-- 原月供 -->
                <div class="result-header original">
                    <div class="result-label">原月供</div>
                    <div class="result-value original">${Utils.formatMoney(result.originalMonthlyPayment)}</div>
                </div>

                <!-- 新月供 -->
                <div class="result-header highlight">
                    <div class="result-label">新月供</div>
                    <div class="result-value new">${Utils.formatMoney(result.newMonthlyPayment)}</div>
                </div>

                <!-- 差值展示 -->
                <div class="result-divider">
                    <span class="arrow">↓</span>
                    <span class="savings">
                        ${isReducePayment ? Utils.formatMoney(result.monthlySavings) + '/月' : '月供不变'}
                    </span>
                </div>

                <!-- 详细信息 -->
                <div class="result-body">
        `;

        if (isReducePayment) {
            // 期限不变，减少月供
            html += `
                <div class="result-row">
                    <span class="label">节省总利息</span>
                    <span class="value success">${Utils.formatMoney(result.savedInterest)}</span>
                </div>
                <div class="result-row">
                    <span class="label">剩余期限</span>
                    <span class="value">${Utils.formatMonths(result.newRemainingMonths)}</span>
                </div>
                <div class="result-row">
                    <span class="label">提前还款金额</span>
                    <span class="value">${Utils.formatMoney(params.prepaymentAmount)}</span>
                </div>
            `;
        } else {
            // 月供不变，缩短期限
            html += `
                <div class="result-row">
                    <span class="label">节省总利息</span>
                    <span class="value success">${Utils.formatMoney(result.savedInterest)}</span>
                </div>
                <div class="result-row">
                    <span class="label">缩短期限</span>
                    <span class="value highlight">${result.shortenedMonths}个月</span>
                </div>
                <div class="result-row">
                    <span class="label">新剩余期限</span>
                    <span class="value">${Utils.formatMonths(result.newRemainingMonths)}</span>
                </div>
                <div class="result-row">
                    <span class="label">提前还款金额</span>
                    <span class="value">${Utils.formatMoney(params.prepaymentAmount)}</span>
                </div>
            `;
        }

        html += `
                </div>

                <!-- 操作按钮 -->
                <div class="result-actions">
                    <button class="action-btn" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">重新计算</button>
                    <button class="action-btn" onclick="ResultRenderer.shareResult()">分享结果</button>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * 渲染错误信息
     */
    renderError(message) {
        if (!this.resultSection || !this.resultContent) return;

        this.resultContent.innerHTML = `
            <div class="result-card">
                <div class="result-empty">
                    <div class="result-empty-icon">⚠️</div>
                    <p>${message}</p>
                </div>
            </div>
        `;

        this.show();
    }

    /**
     * 显示结果区域
     */
    show() {
        this.resultSection.classList.add('show');

        // 滚动到结果区域
        setTimeout(() => {
            Utils.scrollTo(this.resultSection);
        }, 100);
    }

    /**
     * 隐藏结果区域
     */
    hide() {
        this.resultSection.classList.remove('show');
    }

    /**
     * 分享结果（静态方法，用于HTML中的onclick）
     */
    static shareResult() {
        const title = '房贷提前还款计算结果';
        const text = '我使用了房贷提前还款计算器，快速计算出提前还款后的月供变化！';

        if (navigator.share) {
            navigator.share({
                title: title,
                text: text,
                url: window.location.href
            }).catch(err => {
                console.log('分享失败:', err);
                ResultRenderer._copyLink();
            });
        } else {
            ResultRenderer._copyLink();
        }
    }

    /**
     * 复制链接
     * @private
     */
    static _copyLink() {
        const input = document.createElement('input');
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();

        try {
            document.execCommand('copy');
            alert('链接已复制，可以分享给朋友了！');
        } catch (err) {
            alert('复制失败，请手动复制链接');
        }

        document.body.removeChild(input);
    }

    /**
     * 获取结果摘要文本
     * @param {Object} result - 计算结果
     * @param {Object} params - 计算参数
     * @returns {string} 摘要文本
     */
    static getSummary(result, params) {
        const { prepaymentType } = params;
        const isReducePayment = prepaymentType === 'reduce_payment';

        let summary = `房贷提前还款计算结果：\n`;
        summary += `原月供：${Utils.formatMoney(result.originalMonthlyPayment)}\n`;
        summary += `新月供：${Utils.formatMoney(result.newMonthlyPayment)}\n`;

        if (isReducePayment) {
            summary += `每月节省：${Utils.formatMoney(result.monthlySavings)}\n`;
            summary += `节省总利息：${Utils.formatMoney(result.savedInterest)}\n`;
        } else {
            summary += `缩短期限：${result.shortenedMonths}个月\n`;
            summary += `节省总利息：${Utils.formatMoney(result.savedInterest)}\n`;
        }

        return summary;
    }
}
