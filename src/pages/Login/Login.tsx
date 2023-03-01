import { useState, useContext, useEffect } from "react";
import { Input, Button, message } from "antd";
import { $login, $getEexternalUser, $getmenus } from "src/api/login";
import { GlobalContext } from "src/contexts/global";
import { setCookie, removeCookie } from "src/cookie";

const Login = () => {
  const { setGlobalData, setLoadGlobalFinish } = useContext(GlobalContext);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleChangeUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
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

        window.location.href = "/";
      } else {
        message.error("登录失败，请重试");
        removeCookie("q_sso_uid");
        removeCookie("sso_uid");
        removeCookie("external_user");
      }
    } catch (e: any) {
      message.error(e.message);
      removeCookie("q_sso_uid");
      removeCookie("sso_uid");
      removeCookie("external_user");
    }
  };

  const handleLogin = async () => {
    try {
      const res: any = await $login({ name, password });
      setCookie("q_sso_uid", res.userid);
      setCookie("sso_uid", res.userid);
      setCookie("external_user", true);
      login();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  useEffect(() => {
    removeCookie("q_sso_uid");
    removeCookie("sso_uid");
    removeCookie("external_user");
  }, []);

  return (
    <div>
      <Input value={name} placeholder="账号" onChange={handleChangeUser} />
      <Input
        value={password}
        placeholder="密码"
        onChange={handleChangePassword}
      />
      <Button type="primary" onClick={handleLogin}>
        确定
      </Button>
    </div>
  );
};

export default Login;
