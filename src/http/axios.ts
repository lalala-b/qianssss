/* eslint-disable no-restricted-globals */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
import { AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "./request";
import { removeCookie } from "@/cookie";

const requestList: any[] = [];
interface CustomParamsType {
  notLoading?: boolean;
}

interface RequestConfigType extends AxiosRequestConfig {
  customParams?: any
}

interface ResponseConfigType extends AxiosResponse {
  message?: string;
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
    window.addEventListener("keyup", preventEvent, true);
    window.addEventListener("keydown", preventEvent, true);
  }
};

// 添加请求拦截器
axios.interceptors.request.use(
  (config: RequestConfigType) => {
    // const authorization = localStorage.getItem("authorization");
    // config.headers.common["authorization"] = authorization;
    // config.headers.common["x-forwarded-user"] = "185780519919960064";
    let customParams = {};
    // 为了防止同时有多次请求，所有只有第一次触发的请求才将之前的焦点状态存储
    if (config?.data?.customParams) {
      config.customParams = config.data.customParams;
      customParams = config.data.customParams;
      delete config.data.customParams;
    }
    requestBefore(customParams);
    return config;
    // 是否使用谷歌扩展获取加密信息
    // let useExtension = !!Number(localStorage.getItem('useExtension'));
    // return getMacInfo()
    //   .then(macinfo => {
    //     let app = vuex.state.app;
    //     let store = app.store;
    //     //统一将驼峰转为下划线给后台
    //     if (config.data && typeof config.data === 'object') {
    //       config.data = objectTrim(humps.decamelizeKeys(config.data), function(
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
axios.interceptors.response.use(
  (response: ResponseConfigType) => {
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
      return Promise.reject(data.message || 'error')
    } 
    if (data.code === 100401) {
      // 登陆失效
      removeCookie('sso_uid')
      window.location.href = "/#/login";
      return false
    }
    return Promise.resolve(data.data)
    
  },
  error => {
    requestAfter(error.config?.customParams);

    // 对响应错误做点什么
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject({
      ...error,
      message: "commom.netWordError",
    });
  }
);
