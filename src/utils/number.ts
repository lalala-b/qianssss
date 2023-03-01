/* eslint-disable no-restricted-properties */
/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */

export function isNumber(num: number) {
  return Object.prototype.toString.call(num) === "[object Number]";
}
export function isString(str: string) {
  return Object.prototype.toString.call(str) === "[object string]";
}
export const isUndefined = (obj: any) => typeof obj === "undefined";

export const isUndef = (obj: any) =>
  isUndefined(obj) || obj === null || obj === "null";

/**
 * Number formatting
 * like 10000 => 10k
 * @param {number} num
 * @param {number} digits
 */
export function numberFormatter(num: number, digits: number) {
  const si = [
    { value: 1e18, symbol: "E" },
    { value: 1e15, symbol: "P" },
    { value: 1e12, symbol: "T" },
    { value: 1e9, symbol: "G" },
    { value: 1e6, symbol: "M" },
    { value: 1e3, symbol: "k" },
  ];
  for (let i = 0; i < si.length; i += 1) {
    if (num >= si[i].value) {
      return (
        (num / si[i].value)
          .toFixed(digits)
          .replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + si[i].symbol
      );
    }
  }
  return num.toString();
}

/**
 * 10000 => "10,000"
 * @param {number} num
 */
export function toThousandFilter(num: number) {
  const reg = /^[0-9]+.?[0-9]*$/;
  if (!reg.test(String(num))) {
    return num;
  }
  return (+num || 0)
    .toString()
    .replace(/^-?\d+/g, m => m.replace(/(?=(?!\b)(\d{3})+$)/g, ","));
}

/**
 * 转化为百分率形式
 * @param {String} string
 */
export function toRateNumber(str: string) {
  if (str) {
    return `${(Math.round(+str * 10000) / 100.0).toFixed(1)}%`;
  }
  return "--";
}

/**
 * Upper case first char
 * @param {String} string
 */
export function uppercaseFirst(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function toThousands(num: any) {
  if (!isNumber(num)) {
    return "--";
  }
  if (!num) {
    num = 0;
  }
  num = String(num).split(".");
  const postfix = num.length > 1 ? `.${num.pop()}` : "";
  num = num[0];
  return num.replace(/(\d)(?=(?:\d{3})+$)/g, "$1,") + postfix;
}

export function toThousandsW(num: any) {
  if (!isNumber(num / 1) || isUndef(num)) {
    return "--";
  }

  if (num > 10000 || num < -10000) {
    num = `${parseFloat((num / 10000).toFixed(2))}w`;
  }

  num = String(num).split(".");
  const postfix = num.length > 1 ? `.${num.pop()}` : "";
  num = num[0];
  return num.replace(/(\d)(?=(?:\d{3})+$)/g, "$1,") + postfix;
}

export function toThousandsW0(num: any) {
  if (!isNumber(num)) {
    return "--";
  }

  if (num >= 10000) {
    num = `${(num / 10000).toFixed(0)}w`;
  }

  num = String(num).split(".");
  const postfix = num.length > 1 ? `.${num.pop()}` : "";
  num = num[0];
  return num.replace(/(\d)(?=(?:\d{3})+$)/g, "$1,") + postfix;
}

export function toFloorThousandsW(num: any) {
  if (!isNumber(num / 1) || isUndef(num)) {
    return "--";
  }

  if (num > 10000) {
    num = `${(Math.floor((num / 10000) * 100) / 100).toFixed(2)}w`;
  }

  num = String(num).split(".");
  const postfix = num.length > 1 ? `.${num.pop()}` : "";
  num = num[0];
  return num.replace(/(\d)(?=(?:\d{3})+$)/g, "$1,") + postfix;
}

export function emptyFill(val: any) {
  if (val !== "0" && val !== 0 && !val) {
    return "--";
  }
  return val;
}

export const formatUnit = (value: any) => {
  let unit = "";
  if (!value) return 0;
  if (value > 100000000 || value < -100000000) {
    value = Number((value / 100000000).toFixed(2));
    unit = "亿";
  } else if (value > 10000 || value < -10000) {
    value = Number((value / 10000).toFixed(2));
    unit = "w";
  }
  return value + unit;
};

export const smalltoBIG = (n: number) => {
  const fraction = ["角", "分"];
  const digit = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
  const unit = [
    ["元", "万", "亿"],
    ["", "拾", "佰", "仟"],
  ];
  const head = n < 0 ? "欠" : "";
  n = Math.abs(n);

  let s = "";

  for (let i = 0; i < fraction.length; i += 1) {
    s += (
      digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]
    ).replace(/零./, "");
  }
  s = s || "整";
  n = Math.floor(n);

  for (let i = 0; i < unit[0].length && n > 0; i += 1) {
    let p = "";
    for (let j = 0; j < unit[1].length && n > 0; j += 1) {
      p = digit[n % 10] + unit[1][j] + p;
      n = Math.floor(n / 10);
    }
    s = p.replace(/(零.)*零$/, "").replace(/^$/, "零") + unit[0][i] + s;
  }
  return (
    head +
    s
      .replace(/(零.)*零元/, "元")
      .replace(/(零.)+/g, "零")
      .replace(/^整$/, "零元整")
  );
};
