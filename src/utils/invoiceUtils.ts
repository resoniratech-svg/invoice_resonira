const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertToWords(num: number): string {
  if (num === 0) return 'Zero';
  if (num < 0) return 'Minus ' + convertToWords(Math.abs(num));

  let words = '';

  if (Math.floor(num / 10000000) > 0) {
    words += convertToWords(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }

  if (Math.floor(num / 100000) > 0) {
    words += convertToWords(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }

  if (Math.floor(num / 1000) > 0) {
    words += convertToWords(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }

  if (Math.floor(num / 100) > 0) {
    words += convertToWords(Math.floor(num / 100)) + ' Hundred ';
    num %= 100;
  }

  if (num > 0) {
    if (words !== '') words += 'and ';
    if (num < 20) {
      words += ones[num];
    } else {
      words += tens[Math.floor(num / 10)];
      if (num % 10 > 0) {
        words += ' ' + ones[num % 10];
      }
    }
  }

  return words.trim();
}

export function amountToWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let result = convertToWords(rupees) + ' Rupees';
  
  if (paise > 0) {
    result += ' and ' + convertToWords(paise) + ' Paise';
  }
  
  return result + ' Only';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateReferenceNumber(): string {
  const random = Math.floor(Math.random() * 9000) + 1000;
  const suffix = Math.floor(Math.random() * 9000) + 1000;
  return `${random}-${suffix}`;
}

export function calculateLineItemTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

export function calculateSubtotal(lineItems: { total: number }[]): number {
  return lineItems.reduce((sum, item) => sum + item.total, 0);
}

export function calculateGST(subtotal: number, rate: number): number {
  return subtotal * (rate / 100);
}

export function calculateGrandTotal(subtotal: number, gstAmount: number): number {
  return subtotal + gstAmount;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
