/* eslint-disable import/prefer-default-export */
import dayjs from "dayjs";

export const getMonthStartEnd = () => {
  // 获取当前时间
  const date = new Date();
  // 获取当前月的第一天
  const monthStart = date.setDate(1);
  // 获取当前月
  const currentMonth = date.getMonth();
  // 获取到下一个月，++currentMonth表示本月+1，一元运算
  const nextMonth = currentMonth + 1;
  // 获取到下个月的第一天
  const nextMonthFirstDay: any = new Date(date.getFullYear(), nextMonth, 1);
  // 一天时间的毫秒数
  const oneDay = 1000 * 60 * 60 * 24;
  // 获取当前月第一天和最后一天
  const firstDay = dayjs(monthStart).format("YYYY-MM-DD");
  // nextMonthFirstDay-oneDay表示下个月的第一天减一天时间的毫秒数就是本月的最后一天
  const lastDay = dayjs(nextMonthFirstDay - oneDay).format("YYYY-MM-DD");
  return {
    firstDay: `${firstDay} 00:00:00`,
    lastDay: `${lastDay} 23:59:59`,
  };
};
