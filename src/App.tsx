/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable react/no-array-index-key */
import { useState, useContext, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useLocation, useNavigate } from "react-router";
import { GlobalContext } from "src/contexts/global";
import { $getEexternalUser, $getmenus } from "src/api/login";
import {
  ConfigProvider,
  message,
  Layout,
  Menu,
  MenuProps,
  Dropdown,
} from "antd";
import zhCN from "antd/es/locale/zh_CN";
import routes from "./router";
import "./App.css";
import "moment/locale/zh-cn";

const { Sider, Content, Header } = Layout;
type MenuItem = Required<MenuProps>["items"][number];

function App() {
  const {
    globalData = {},
    setGlobalData,
    loadGlobalFinish,
    setLoadGlobalFinish,
  } = useContext(GlobalContext);
  const location = useLocation();
  const history = useNavigate();

  const [routeList, setRouteList] = useState(
    routes.filter(item => item.type === "base")
  );

  window.$permission = (code: string) => {
    const index = (globalData?.user?.userInfo?.permissions || []).findIndex(
      (item: any) => item.name === code
    );
    return index > -1;
  };

  window.qpComponentId = globalData.componentId;

  // 根据接口加载路由列表
  const getMemu = (routes: any) => {
    const memuList = globalData?.user?.userInfo?.menuList;
    const newRoutes = routes
      .map((item: any) => {
        const newItem = { ...item };

        if (newItem.type === "base") return newItem;

        if (memuList.findIndex((it: any) => it.name === newItem.name) <= -1) {
          return "";
        }

        if (newItem.children) {
          newItem.children = getMemu(newItem.children);
        }

        return newItem;
      })
      .filter((item: any) => item);
    return newRoutes;
  };

  // 根据加载好的路由列表 加载菜单导航项
  const menuItem = (routes: any) =>
    routes
      .map((item: any) => {
        const newItem: any = { ...item };
        newItem.key = item.name;
        delete newItem.exact;

        if (newItem.hidden) {
          return "";
        }

        if (newItem.children) {
          newItem.children = menuItem(newItem.children);
        }
        return newItem;
      })
      .filter((item: any) => item && item.type !== "base") as MenuItem[];

  // 根据加载好的路由列表 加载真正渲染的路由
  const getRealRouter = (routes: any) => {
    const res: any[] = [];
    routes.forEach((item: any) => {
      if (item.component) {
        res.push(item);
      }

      if (item.children) {
        res.push(getRealRouter(item.children));
      }
    });

    return res.flat(Infinity);
  };

  const login = async () => {
    try {
      const res: any = await $getEexternalUser();
      const permissionRes: any = await $getmenus({ userid: res.id });
      if (permissionRes.code === 1) {
        setGlobalData?.({
          user: { userInfo: { ...res, ...permissionRes.data } },
        });

        setLoadGlobalFinish?.(true);
        window.$permission = (code: string) => {
          const index = (permissionRes.data?.permissions || []).findIndex(
            (item: any) => item.name === code
          );
          return index > -1;
        };
      } else {
        window.location.href = "/#/login";
      }
    } catch (e: any) {
      message.error("登录失效，请重新登录");
      window.location.href = "/#/login";
    }
  };

  const handleSelectMenu = ({ item }: any) => {
    history(item.props.path);
  };

  const handleLogOut = () => {
    window.location.href = "/#/login";
  };

  useEffect(() => {
    // 去除参数
    const markHref = window.location.hash.indexOf("?") > -1
      ? window.location.hash.slice(0, window.location.hash.indexOf("?"))
      : window.location.hash;

    performance.mark(markHref);

    // 在乾坤中运行
    if (window.__POWERED_BY_QIANKUN__) return;

    // 非登录页面尝试调起获取用户信息及菜单
    if (location.pathname === "/login") return;

    login();
  }, []);

  useEffect(() => {
    // 在乾坤中运行 且全局数据加载完毕
    if (window.__POWERED_BY_QIANKUN__ && loadGlobalFinish) {
      setRouteList(routes);
    }
  }, [window.__POWERED_BY_QIANKUN__, loadGlobalFinish]);

  // 动态加载菜单
  useEffect(() => {
    // 在乾坤中运行
    if (window.__POWERED_BY_QIANKUN__) return;
    if (!(globalData?.user?.userInfo?.menuList || []).length) return;
    setRouteList(getMemu(routes));
  }, [JSON.stringify(globalData?.user?.userInfo?.menuList)]);

  // 让表格中sticky的滚动条消失
  const handleToDisappearScrollBar = (e: any) => {
    const scrollBar = document.getElementsByClassName(
      "ant-table-sticky-scroll"
    )[0];
    if (!scrollBar) return;
    const { scrollHeight, scrollTop, clientHeight } = e.target;
    if (scrollHeight - scrollTop < clientHeight + 150) {
      scrollBar.classList.add("qp-disappear");
    } else if (scrollBar.classList.contains("qp-disappear")) {
      scrollBar.classList.remove("qp-disappear");
    }
  };

  useEffect(() => {
    const appMain = document.getElementById("appMain");
    if (appMain) {
      appMain.onscroll = handleToDisappearScrollBar;
    }

    return () => {
      if (appMain) {
        appMain.onscroll = () => {
          //
        };
      }
    };
  }, []);

  return (
    <ConfigProvider locale={zhCN}>
      <div className={window.__POWERED_BY_QIANKUN__ ? "qiankun" : ""}>
        <Layout>
          {/* 非乾坤运行 且非是基础页 加载header */}
          {!window.__POWERED_BY_QIANKUN__ &&
            routeList.find(item => item.path === location.pathname)?.type !==
              "base" && (
              <Header className="qp-layout-header">
                <div>
                  <img
                    className="qp-layout-logo"
                    src="https://img1.zhuanstatic.com/zlj/qianshuju/static/img/logo.ee2e4b16f8a5354a05c0b926624d4141.png"
                    alt=""
                  />
                </div>
                <div>
                  <img
                    className="qp-layout-avatar"
                    src={globalData?.user?.userInfo?.avatar}
                    alt=""
                  />

                  <Dropdown
                    overlay={
                      <Menu
                        items={[
                          {
                            label: <span onClick={handleLogOut}>退出登录</span>,
                            key: "0",
                          },
                        ]}
                      />
                    }
                    arrow
                    placement="bottom"
                    trigger={["click"]}
                  >
                    <span className="qp-layout-name">
                      {globalData?.user?.userInfo?.name}
                    </span>
                  </Dropdown>
                </div>
              </Header>
            )}
          <Layout>
            {/* 非乾坤运行 且非是基础页 加载侧边栏 */}
            {!window.__POWERED_BY_QIANKUN__ &&
              routeList.find(item => item.path === location.pathname)?.type !==
                "base" && (
                <Sider
                  trigger={null}
                  collapsible
                  style={{
                    overflow: "auto",
                    height: "100vh",
                    position: "fixed",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    background: "#fff",
                    paddingTop: "65px",
                  }}
                >
                  <Menu
                    defaultSelectedKeys={["1"]}
                    defaultOpenKeys={["sub1"]}
                    mode="inline"
                    inlineCollapsed
                    items={menuItem(routeList)}
                    onSelect={handleSelectMenu}
                  />
                </Sider>
              )}
            {/* 乾坤运行或者基础页 不加载布局 */}
            {window.__POWERED_BY_QIANKUN__ ||
            routeList.find(item => item.path === location.pathname)?.type ===
              "base" ? (
              <>
                <Routes>
                  {getRealRouter(routeList).map((item: any, index: number) => (
                    <Route
                      key={index}
                      path={item.path}
                      element={item.component}
                    />
                  ))}
                </Routes>
              </>
            ) : (
              <Layout style={{ marginLeft: 200, marginTop: 64 }}>
                <Content
                  style={{
                    padding: "24px 16px",
                    minHeight: "100vh",
                    overflow: "initial",
                  }}
                >
                  <Routes>
                    {getRealRouter(routeList).map(
                      (item: any, index: number) => (
                        <Route
                          key={index}
                          path={item.path}
                          element={item.component}
                        />
                      )
                    )}
                  </Routes>
                </Content>
              </Layout>
            )}
          </Layout>
        </Layout>
      </div>
    </ConfigProvider>
  );
}

export default App;
