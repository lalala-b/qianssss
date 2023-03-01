/* eslint-disable import/no-absolute-path */
/* eslint-disable no-unused-expressions */
/* eslint-disable react/no-deprecated */
/* eslint-disable no-underscore-dangle */
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
import { setGlobalData, setLoadGlobalFinish } from "src/utils/global";
import { GlobalProvider } from "src/contexts/global";
// import moment from 'moment';
// import { setCookie } from "./cookie/cookie";
import "moment/locale/zh-cn";
import App from "./App";
import "./index.css";
import "src/icons/icons";

function render() {
  ReactDOM.render(
    <HashRouter>
      <GlobalProvider>
        <App />
      </GlobalProvider>
    </HashRouter>,
    document.getElementById("root")
  );
}

if (!window.__POWERED_BY_QIANKUN__) {
  render();

  // cookie设置
  // setCookie("OCTOPUS_LOGIN_STATUS", true);
  // setCookie("q_sso_uid", "qy01d460bec72eb206281b3b117f");
  // setCookie("external_user", true);
}

type element = Element | DocumentFragment;

/**
 * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。
 * 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等。
 */
export const bootstrap: () => void = async () => {
  console.info("---bootstrap");
};
/**
 * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
 */
export const mount: (props: any) => void = async props => {
  await render();
  setGlobalData(props.data);
  setLoadGlobalFinish(true);
};

/**
 * 可选生命周期钩子，仅使用 loadMicroApp 方式加载微应用时生效
 */
export const update: (props: any) => void = async props => {
  // 通过props.clearMicroapp来控制销毁操作，是需要避免切换路由时重复上一次的渲染，导致多次请求
  if (props.clearMicroapp) {
    document.getElementById("root") &&
      ReactDOM.unmountComponentAtNode(
        document.getElementById("root") as element
      );
  }
};

/**
 * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
 */
export const unmount: () => void = async () => {
  console.info("----unmount");
};

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
