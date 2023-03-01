/* eslint-disable no-bitwise */
/* eslint-disable no-param-reassign */
/* eslint-disable no-multi-assign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-useless-escape */
import { lego } from "@zz-common/lego";

const getResult = (r, startTime) => {
  try {
    const result = {
      start:
        typeof r.fetchStart !== "undefined"
          ? Number(parseInt(r.fetchStart, 10) - startTime).toFixed(2)
          : 0,
      fstart:
        typeof r.requestStart !== "undefined"
          ? Number(
              parseInt(r.requestStart || r.fetchStart, 10) - startTime
            ).toFixed(2)
          : 0,
      end:
        typeof r.responseEnd !== "undefined"
          ? Number(parseInt(r.responseEnd, 10) - startTime).toFixed(2)
          : 0,
      name: "",
    };

    result.name = r.name.slice(
      r.name.indexOf("/api"),
      r.name.indexOf("?") > -1 ? r.name.indexOf("?") : r.name.length
    );

    return result;
  } catch (err) {
    // console.error(err)
    return {
      start: 0,
      fstart: 0,
      end: 0,
      name: r.name.split("/").splice(-1, 1)[0],
    };
  }
};

const getOS = () => {
  try {
    let result = "";
    const UA = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod|ios/gi.test(UA);
    const isAndroid = /android/gi.test(UA);

    if (UA) {
      if (isAndroid) {
        result = "android";
      } else if (isIOS) {
        result = "ios";
      } else {
        result = "pc";
      }
    }
    return result;
  } catch (err) {
    // console.error(err)
    return "pc";
  }
};

const getUnique = () => {
  let d = new Date().getTime();
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
};

const calculateNetSpeed = (backup, cb) => {
  const NET_SPEED_IMG_BIG =
    "https://pic2.zhuanstatic.com/zhuanzh/e64c9fed-6dee-4cb9-9bbb-bbbef7ec25a8.png";
  const NET_SPEED_IMG_SMALL =
    "https://pic5.zhuanstatic.com/zhuanzh/8a208a4e-9d33-4c22-b6d9-b0db1574c7e6.png";
  const NET_SPEED_IMG_SIZE = 5;

  let isCallback = false;
  let timer = setTimeout(() => {
    clearTimeout(timer);
    timer = null;
    if (!isCallback) {
      // 图片加载出错超时 30004  速度可以认为小于2.5k/s
      backup.netSpeed = "30004";
      isCallback = true;
    }
  }, 4500);
  try {
    const smallImgData = window.netSpeedSmallImg
      ? window.netSpeedSmallImg
      : (window.netSpeedSmallImg = {});
    const imgData = window.netSpeedImg || (window.netSpeedImg = {});
    const _unique = getUnique();
    let smallImg = (smallImgData[_unique] = new Image());
    let img = (imgData[_unique] = new Image());
    let start = 0;
    smallImg.onload = smallImg.onerror = () => {
      smallImg.onload = smallImg.onerror = null;
      smallImg = smallImgData[_unique] = null;
      start = performance.now ? performance.now() : new Date().getTime();
      img.src = `${NET_SPEED_IMG_BIG}?_unique=${_unique}`;
    };
    smallImg.src = `${NET_SPEED_IMG_SMALL}?_unique=${_unique}`;
    img.onload = img.onerror = () => {
      img.onload = img.onerror = null;
      img = imgData[_unique] = null;
      const netTime =
        parseInt(
          (performance.now ? performance.now() : new Date().getTime()) - start,
          10
        ) || 0;
      // 存在一个问题，网速比较慢，测速一直没有完成。但是已经认为30004了。backup已经转成字符串了。导致了报错
      if (typeof backup === "object" && !isCallback) {
        backup.netSpeed = Number((NET_SPEED_IMG_SIZE * 1000) / netTime).toFixed(
          2
        );
      }
      isCallback = true;
      if (cb) cb(backup.netSpeed);
    };
  } catch (err) {
    // console.error(err)
    // 图片加载出错 30003
    backup.netSpeed = "30003";
    isCallback = true;
    if (cb) cb(backup.netSpeed);
  }
};

const sendPerf = () => {
  // 独立运行不上报，目前独立运行仅是测试
  if (!window.__POWERED_BY_QIANKUN__) return;

  setTimeout(() => {
    const lastPerformanceUrl =
      window.localStorage.getItem("lastPerformanceUrl");

    // 去除参数
    const markHref =
      window.location.hash.indexOf("?") > -1
        ? window.location.hash.slice(0, window.location.hash.indexOf("?"))
        : window.location.hash;

    // 说明是二次请求了，不需要在上报，不是首屏的时间
    if (lastPerformanceUrl === markHref) return;

    const performance = window.performance.getEntries();

    // 找到在APP中打点的最后一个url
    const markIndex = performance.findLastIndex(
      item => item.name === markHref && item.entryType === "mark"
    );

    if (markIndex === -1) return;

    // 当前页性能数据
    const currentPerformance = performance.slice(markIndex);

    console.info("-----", currentPerformance);
    // 进入页面并开始打点的时间
    const markStartTime = currentPerformance[0].startTime;

    // 因整体单页SPA应用，以下大多数指标统计无意义或不好统计，目前只统计ajax、首屏等相关时间
    const performancBackUp = {
      token: "",
      uid: "",
      t: "25",
      zlj_device_id: "",
      endType: "m",
      fromType: "m",
      version: "",
      isoffline: 0,
      isprerender: 0,
      isFirst: 1,
      iszz: 0,
      clientType: "other",
      netType: "",
      operatorType: "",
      zzv: "",
      zzt: "25",
      phoneType: "null",
      size: "",
      domInteractiveTime: 0,
      webviewInitTime: 0,
      iszlj: 0,
      ishunter: 0,
      mark: "load",
      bodysize: 0,
      // 以上参数乾数据中用不到，为了保证数据完整性，先写死

      // 白屏时间
      blankTime: 0,
      // 重定向开始
      rdStartTime: 0,
      // 重定向结束
      rdEndTime: 0,
      // 浏览器发起请求的时间
      fStartTime: 0,
      // connect开始
      cStartTime: 0,
      // connect结束
      cEndTime: 0,
      // dns开始时间
      dnsStartTime: 0,
      // dns结束时间
      dnsEndTime: 0,
      // dns整体耗时
      dnsTime: 0,
      // 浏览器开始接受数据的时间，首包时间,即ttf时间, 浏览器收到从服务端（或缓存，本地资源）响应回的第一个字节的数据的时刻
      fpTime: 0,
      // http请求耗时
      fpEndTime: 0,
      // 开始解析dom时间,document对象构建完成
      domStartTime: 0,
      // 首次渲染时间
      firstPiantTime: 0,
      readyTime: 0,
      atfStartTime: 0,
      // dom完全构建
      domLoadedTime: 0,
      // 首屏时间
      atfTime: 0,
      // 可交互时间，目前与首屏相同即可
      activeTime: 0,
      // 加载时间， 目前与首屏相同即可
      loadTime: 0,
      domain: [],
      // 静态资源数组, 不统计 为空
      source: [],
      ajax: [],
      sourceMax: 0,
      sourceMin: 0,
      imgsMax: 0, // 关键资源时间
      sourceTime: 0,
      imgsMin: 0,
      // 关键图片资源时间
      imgsTime: 0,
      fmp: 0,
      fmpImg: 0,
      pageurl: `data.qpmcn.com/zlj/qianshuju${markHref.slice(1)}`,
      netSpeed: "",
      ajaxMax: 0,
      ajaxMin: 0,
      ajaxTime: 0,
    };

    const ajaxMax = [];
    const ajaxMin = [];

    performancBackUp.ajax = currentPerformance
      .slice(1)
      .map(item => {
        if (!/\.(js|css|png|gif|jpeg|webp|jpg)/gi.test(item.name)) {
          const rs = getResult(item, markStartTime);
          ajaxMax.push(rs.end > 0 ? rs.end : 0);
          ajaxMin.push(rs.start > 0 ? rs.start : 0);
          return rs;
        }
        return ''
      }).filter(item => item)
      .map(v => `${v.name}|${v.start}|${v.fstart}|${v.end}|true`);

    performancBackUp.ajaxMax = ajaxMax.length
      ? Math.max.apply(null, ajaxMax)
      : 0;
    performancBackUp.ajaxMin = ajaxMin.length
      ? Math.min.apply(null, ajaxMin)
      : 0;
    performancBackUp.ajaxTime =
      Number(performancBackUp.ajaxMax - performancBackUp.ajaxMin).toFixed(2)

    performancBackUp.atfTime = performancBackUp.ajaxMax;
    performancBackUp.activeTime = performancBackUp.ajaxMax;
    performancBackUp.loadTime = performancBackUp.ajaxMax;
    performancBackUp.fmp = performancBackUp.ajaxMax;

    calculateNetSpeed(performancBackUp, netSpeed => {
      performancBackUp.netSpeed = netSpeed;
      const params = {
        appid: "ZHUANZHUAN",
        pagetype: `data.qpmcn.com-zlj-qianshuju${markHref.slice(1)}`,
        actiontype: "PERFORMANCE",
        abtesttype: "ALL",
        lon: 0,
        lat: 0,
        ua: window.navigator.userAgent.toLowerCase(),
        os: getOS(),
        backup: {
          ...performancBackUp,
        },
      };
  
      lego.send(params);
  
      window.localStorage.setItem("lastPerformanceUrl", markHref);
    });
  });
};

export default sendPerf;
