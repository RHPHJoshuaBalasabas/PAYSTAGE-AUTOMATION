class Currency {
    static JPY = 'JPY';
    static MYR = 'MYR';
    static IDR = 'IDR';
    static THB = 'THB';
    static VND = 'VND';

    constructor(currency) {
        this.currency = currency;
    }

    shouldRoundDown() {
        switch (this.currency) {
            case Currency.JPY:
            case Currency.MYR:
            case Currency.IDR:
            case Currency.THB:
            case Currency.VND:
            return true;
        default:
            return false;
        }
    }

    applyBusinessRounding(amount, roundUpForFees = false) {
        const defaultDecimals = 2;
        const roundUpDecimals = 4;

        if (this.shouldRoundDown()) {
            return Math.ceil(this.roundToDecimals(amount, roundUpDecimals));
        }

        if (roundUpForFees) {
            return this.roundToDecimals(Math.ceil(this.roundToDecimals(amount * 100, roundUpDecimals)) / 100, defaultDecimals);
        }

        return this.roundToDecimals(amount, defaultDecimals);
    }

    roundToDecimals(value, decimals) {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }
}

  // Example usage:
const currency = new Currency(Currency.JPY);
const roundedAmount = currency.applyBusinessRounding(1234.5678, true);
console.log(roundedAmount);