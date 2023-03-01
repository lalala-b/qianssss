/* eslint-disable import/prefer-default-export */
/* eslint-disable no-prototype-builtins */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */

const judge = (obj1: any, obj2: any, key: any, type1: any, type2: any) => {
  let flag = true;
  if (
    type1 === "string" ||
    type1 === "number" ||
    type1 === "boolean" ||
    type1 === "undefined"
  ) {
    // 如果值  是简单类型，
    if (obj1[key] !== obj2[key]) {
      flag = false;
    }
  } else if (type1 === "object" && obj1[key] === null) {
    // 如果值是 null
    if (obj2[key] !== null) {
      flag = false;
    }
  } else if (type1 === "object" && type1 instanceof Date) {
    // 如果值 是日期
    if ((!type2 as any) instanceof Date) {
      flag = false;
    }
    if (obj1[key] !== obj2[key]) {
      flag = false;
    }
  } else if (type1 === "object" && !Array.isArray(obj1[key])) {
    // 如果值 是个对象
    if (Array.isArray(obj2[key])) {
      //
      flag = false;
    } else {
      const result = objEqual(obj1[key], obj2[key]);
      flag = result;
    }
  } else if (type1 === "object" && Array.isArray(obj1[key])) {
    // 值是数组
    if (!Array.isArray(obj2[key])) {
      return false;
    }
    if (obj1[key].length !== obj2[key].length) {
      // 数组项项数不一样啊
      return false;
    }
    for (let i = 0; i < obj1[key].length; i += 1) {
      const type11 = typeof obj1[key][i];
      const type22 = typeof obj2[key][i];
      // arr: [1, 2, [1, 2, 3], { name: 554 }]
      const result: any = judge(obj1[key], obj2[key], i, type11, type22);
      if (!result) {
        return result;
      }
      flag = result;
    }
  }
  return flag;
};

export const objEqual = (obj1: any, obj2: any) => {
  let flag = true;
  // 先判断，key的长度是否相等，
  if (
    Object.getOwnPropertyNames(obj1).length !==
    Object.getOwnPropertyNames(obj2).length
  ) {
    return false;
  }
  for (const key in obj1) {
    // 先看看 两个对象中是否都包含这个key
    if (!obj2.hasOwnProperty(key)) {
      // obj2 没有这个key
      return false;
    }
    const type1 = typeof obj1[key];
    const type2 = typeof obj2[key];
    if (type1 !== type2) {
      // 有这个key，但是 值的类型不同
      return false;
    }
    flag = judge(obj1, obj2, key, type1, type2);

    if (!flag) {
      return false;
    }
  }
  return true;
};
