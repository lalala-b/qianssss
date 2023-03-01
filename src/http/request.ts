/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { removeCookie } from "src/cookie/cookie";
import { isString } from "src/utils/number";
import qs from "qs";

// const isQp =  window.location.href.indexOf('qp.zhuanspirit.com') > -1
// const isMcn =  window.location.href.indexOf('qpmcn.zhuanspirit.com') > -1

const pendingAjax: any[] = [];
const cancelType = 1;
const FAST_CLICK_MSG = "数据请求中，请稍候";
const CANCEL_TEXT = "USER CANCEL";
const { CancelToken } = axios;
// 处理请求中的ajax
const handlePendingAjax = (config: any, c?: any) => {
  if (!config) return;

  let url = config.url + JSON.stringify(config.params);
  url = url.slice(0, url.indexOf('{'))
  const index = pendingAjax.findIndex((i: any) => i.url === url);
  // if (cancelType === 0) {
  //   if (index > -1) {
  //     c ? c(FAST_CLICK_MSG) : pendingAjax.splice(index, 1);
  //   } else {
  //     c && pendingAjax.push({ url, c });
  //   }
  // } else if (cancelType === 1) {
  if (index > -1) {
    c && pendingAjax[index].c(FAST_CLICK_MSG);
    pendingAjax.splice(index, 1);
  }
  c && pendingAjax.push({ url, c });
  // }
};

const myAxios = axios.create({
  baseURL: "/api",
  timeout: 20000,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json",
    withCredentials: true,
  },
  // withCredentials: true,
  paramsSerializer: params => qs.stringify({ ...params }),
  transformRequest: (data: any) => {
    if (Object.prototype.toString.call(data) === '[object Object]') {
      Object.keys(data).forEach(key => {
        if (data[key] === undefined) {
          data[key] = null;
        }
      });
    }

    try {
      isString(data) && (data = JSON.parse(data));
      const para = JSON.stringify({
        ...data,
        ...{ componentId: window.qpComponentId },
      });
      return para;
    } catch (err) {
      return data;
    }
  },
});
interface ConfigType {
  customParams?: any;
  withCredentials?: boolean;
}

// 查询数据列表公用方法 get
export const get = (
  url: string,
  val?: any,
  config: ConfigType = {}
): Promise<void> =>
  myAxios.get(url, {
    params: val,
    ...config,
    data: { customParams: config.customParams },
  });

// 删除公用方法
export const del = (url: string, data: any, config: any = {}): Promise<void> =>
  myAxios.delete(url, {
    data: config.customParams
      ? { ...data, customParams: config.customParams }
      : data,
    ...config,
  });

export const post = (
  url: string,
  val: any,
  config: any = {}
): Promise<void> => {
  let contentType;

  return myAxios.request({
    url,
    data: config.customParams
      ? { ...val, customParams: config.customParams }
      : val,
    method: "post",
    headers: {
      "Content-type": contentType,
    },
    ...config,
  });
};

// 修改数据公用方法
export const put = (url: string, val: any, config: any = {}): Promise<void> => {
  let contentType;

  return myAxios.request({
    url,
    data: val,
    method: "put",
    headers: {
      "Content-type": contentType,
    },
    ...config,
  });
};

// formadata post 提交数据
export const postFormData = (
  url: string,
  val: any,
  config: any = {}
): Promise<void> =>
  myAxios.request({
    url,
    data: val,
    method: "post",
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
    ...config,
  });

const requestList: any[] = [];
interface CustomParamsType {
  notLoading?: boolean;
}

interface RequestConfigType extends AxiosRequestConfig {
  customParams?: any;
  beforeRequest?: any;
}

interface ResponseConfigType extends AxiosResponse {
  config: RequestConfigType;
}

const preventEvent = (event: Event) => {
  event.stopPropagation();
  event.preventDefault();
  event.stopImmediatePropagation();
};

const requestAfter = (customParams: CustomParamsType): void => {
  if (customParams?.notLoading) return;
  requestList.pop();
  if (requestList.length <= 0) {
    window.removeEventListener("keyup", preventEvent, true);
    window.removeEventListener("keydown", preventEvent, true);
  }
};

const requestBefore = (customParams: CustomParamsType): void => {
  if (customParams?.notLoading) return;
  requestList.push(new Date());
  if (requestList.length <= 1) {
    // 阻止按键事件，防止弹出遮盖后出现按esc 取消弹出层等问题
    // window.addEventListener("keyup", preventEvent, true);
    // window.addEventListener("keydown", preventEvent, true);
  }
};

// 添加请求拦截器
myAxios.interceptors.request.use(
  (config: RequestConfigType) => {
    if (config.method === "post") {
      config.data = Object.assign({}, config.data, {
        componentId: window.qpComponentId,
      });
    } else {
      config.params = Object.assign({}, config.params, {
        componentId: window.qpComponentId,
      });
    }

    if ((config?.url || '').indexOf('oa.zhuaninc.com') > -1) {
      config.headers = {
        "Content-Type": "application/json",
      }

      config.timeout = 50000
    }

    let customParams = {};
    // 为了防止同时有多次请求，所有只有第一次触发的请求才将之前的焦点状态存储
    if (config?.data?.customParams) {
      config.customParams = config.data.customParams;
      customParams = config.data.customParams;
      delete config.data.customParams;
    }
    requestBefore(customParams);

    let cancel;
    if ([0, 1].includes(cancelType)) {
      config.cancelToken = new CancelToken(c => {
        handlePendingAjax(config, c);
        cancel = () => c(CANCEL_TEXT);
      });
    } else {
      config.cancelToken = new CancelToken(c => {
        cancel = () => c(CANCEL_TEXT);
      });
    }

    config.beforeRequest && config.beforeRequest(config, cancel);

    return config;
    // 是否使用谷歌扩展获取加密信息
    // let useExtension = !!Number(localStorage.getItem('useExtension'));
    // return getMacInfo()
    //   .then(macinfo => {
    //     let app = vuex.state.app;
    //     let store = app.store;
    //     //统一将驼峰转为下划线给后台
    //     if (config.data && typeof config.data === 'object') {
    //       config.data = objectTrim(humps.decamelizeKeys(config.data),
    //          function(
    //         key,
    //         convert
    //       ) {
    //         return /^[A-Z0-9_]+$/.test(key) ? key : convert(key);
    //       });
    //     }

    //     if (config.params) {
    //       config.params = objectTrim(
    //         humps.decamelizeKeys(config.params),
    //         function(key, convert) {
    //           return /^[A-Z0-9_]+$/.test(key) ? key : convert(key);
    //         }
    //       );
    //     }

    //     config.headers.common = {
    //       ...config.headers.common,
    //       Language: store.languageAliasName || 'en',
    //       'Account-Token': app.token || '',
    //       'Sign-Type': 2,
    //       Authorization: macinfo ? window.btoa(JSON.stringify(macinfo)) : '',
    //     };
    //     config.requestAssociatedId = generateRequestId();
    //     addRequestLog(
    //       customParams,
    //       config.url,
    //       config.requestAssociatedId,
    //       config.params || config.data
    //     );
    //     // 在发送请求之前做些什么
    //     return config;
    //   })
    //   .catch(e => {
    //     return Message.warning(e);
    //   });
  },
  error => {
    requestAfter(error.config?.customParams);
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
// 统一在window unhandledrejection事件处理未捕获的promise事件
myAxios.interceptors.response.use(
  (response: ResponseConfigType) => {
    handlePendingAjax(response.config);
    requestAfter(response.config?.customParams);

    const { data } = response;

    if (typeof data === "string") {
      return Promise.resolve(data);
    }

    // //统一将后台的下划线转为驼峰转为给前端
    // if (data.data && typeof data.data === "object") {
    //   data.data = humps.camelizeKeys(data.data, function(key, convert) {
    //     return /^[A-Z0-9_]+$/.test(key) ? key : convert(key);
    //   });
    // }

    if (response.status !== 200) {
      return Promise.reject(data.message || "error");
    }
    if (data.code === 100401) {
      // 登陆失效
      removeCookie("q_sso_uid");
      window.location.href = "/#/login";
      return false;
    }

    // 兼容oa的返回值
    if (data.respCode === '0' || data.respCode === 0) {
      return Promise.resolve(data.respData);
    }

    if (+data.code === 0 || data.respCode === '0' || data.respCode === 0) {
      return Promise.reject(data || "error");
    }
    if (+data.code === 500) {
      return Promise.reject(data || "error");
    }

    // 不只有code, data, message, 全部返回
    if (Object.keys(data).length > 3) {
      return Promise.resolve(data);
    }
    
    return Promise.resolve(data.data);
  },
  error => {
    requestAfter(error.config?.customParams);
    // if (error.message !== FAST_CLICK_MSG) {
    //   // 非重复点击导致的请求失败需要清除pendingAjax
    //   pendingAjax.splice(0, pendingAjax.length);
    // } else {
    //   error.type = "Cancel";
    // }

    // 请求取消
    if (error.code === 'ERR_CANCELED' || error.code === 'ECONNABORTED') {
      return Promise.reject(null)
    }

    // 对响应错误做点什么
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject({
      ...error,
      message: "commom.netWordError",
    });
  }
);

export default myAxios;
