let cachedRates = null;
let lastFetchTime = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache

const CURRENCY_SYMBOLS = {
  AED: "د.إ",
  SAR: "﷼",
  KWD: "د.ك",
  BHD: ".د.ب",
  QAR: "﷼",
  OMR: "﷼",
  USD: "$",
  SGD: "S$",
  MYR: "RM",
  THB: "฿",
  PHP: "₱",
  IDR: "Rp",
  VND: "₫",
  CNY: "¥",
  JPY: "¥",
  EUR: "€",
  GBP: "£",
  CHF: "CHF",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  CAD: "C$",
  AUD: "A$",
  MXN: "$",
  BRL: "R$",
  ZAR: "R",
  NGN: "₦",
  EGP: "E£",
  INR: "₹",
  PKR: "₨",
  BDT: "৳",
  LKR: "Rs",
  NPR: "Rs",
};

const COUNTRY_TO_CURRENCY = {
  INDIA: "INR",
  USA: "USD",
  UAE: "AED",
  DUBAI: "AED",
  UK: "GBP",
  CANADA: "CAD",
  AUSTRALIA: "AUD",
  SINGAPORE: "SGD",
  MALAYSIA: "MYR",
  SAUDI_ARABIA: "SAR",
  KUWAIT: "KWD",
  BAHRAIN: "BHD",
  QATAR: "QAR",
  OMAN: "OMR",
  GERMANY: "EUR",
  FRANCE: "EUR",
  ITALY: "EUR",
  SPAIN: "EUR",
  NETHERLANDS: "EUR",
  SWITZERLAND: "CHF",
  SWEDEN: "SEK",
  NORWAY: "NOK",
  DENMARK: "DKK",
  MEXICO: "MXN",
  BRAZIL: "BRL",
  SOUTH_AFRICA: "ZAR",
  NIGERIA: "NGN",
  EGYPT: "EGP",
  PAKISTAN: "PKR",
  BANGLADESH: "BDT",
  SRI_LANKA: "LKR",
  NEPAL: "NPR",
  JAPAN: "JPY",
  CHINA: "CNY",
  THAILAND: "THB",
  PHILIPPINES: "PHP",
  INDONESIA: "IDR",
  VIETNAM: "VND",
};

export const fetchLiveRates = async () => {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/INR");
    const data = await response.json();
    
    if (data && data.rates) {
      cachedRates = data.rates;
      lastFetchTime = Date.now();
      return cachedRates;
    }
  } catch (error) {
    console.error("❌ Failed to fetch live exchange rates:", error.message);
  }
  return null;
};

export const isLiveRatesAvailable = () => {
  return cachedRates !== null;
};

export const getCurrencyFromCountry = (country) => {
  if (!country) return "INR";
  const normalized = country.toUpperCase().trim();
  return COUNTRY_TO_CURRENCY[normalized] || "INR";
};

export const convertCurrency = (amountInINR, targetCurrency) => {
  if (!amountInINR || amountInINR === 0) return 0;
  if (!targetCurrency) return amountInINR;
  
  if (!cachedRates) {
    return amountInINR;
  }
  
  const rate = cachedRates[targetCurrency] || 1;
  const result = amountInINR * rate;
  
  return isNaN(result) ? amountInINR : result;
};

export const formatCurrency = (amount, currencyCode) => {
  if (!amount || isNaN(amount)) {
    return (CURRENCY_SYMBOLS[currencyCode] || currencyCode || "") + "0.00";
  }
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode || "";
  return `${symbol}${Number(amount).toFixed(2)}`;
};

export const getCurrencyInfo = (country) => {
  const currencyCode = getCurrencyFromCountry(country);
  
  if (!cachedRates) {
    return {
      currencyCode: "INR",
      symbol: CURRENCY_SYMBOLS["INR"],
      rate: 1,
      isOriginal: true,
    };
  }
  
  return {
    currencyCode,
    symbol: CURRENCY_SYMBOLS[currencyCode],
    rate: cachedRates[currencyCode] || 1,
    isOriginal: false,
  };
};

export default {
  fetchLiveRates,
  isLiveRatesAvailable,
  getCurrencyFromCountry,
  convertCurrency,
  formatCurrency,
  getCurrencyInfo,
  CURRENCY_SYMBOLS,
  COUNTRY_TO_CURRENCY,
};
