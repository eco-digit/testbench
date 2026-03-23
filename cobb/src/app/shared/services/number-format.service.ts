import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NumberFormatService {
  minNumber = 1e-3;
  maxNumber = 1e6;

  private readonly superscriptMap: Record<string, string> = {
    '-': '⁻',
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
  };

  convertNumberToSuperscript(n: number): string {
    return n
      .toString()
      .split('')
      .map((c) => this.superscriptMap[c])
      .join('');
  }

  toScientificLabel(value: number, digits = 3): string {
    if (!isFinite(value) || value === 0) return '0';
    const [mStr, eStr] = value.toExponential(digits - 1).split('e');
    const mantissa = parseFloat(mStr).toString();
    const exp = parseInt(eStr, 10);
    return `${mantissa} × 10${this.convertNumberToSuperscript(exp)}`;
  }

  formatYAxisTick(value: number, digits = 3): string {
    if (!isFinite(value) || value === 0) return '0';
    const a = Math.abs(value);
    if (a >= this.minNumber && a < this.maxNumber) {
      return value.toLocaleString('en-US', {
        maximumSignificantDigits: digits,
      });
    }
    return this.toScientificLabel(value, digits);
  }
}
