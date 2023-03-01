/* eslint-disable max-len */
import Request from "src/http/request";

export const $login = (params: { name: string; password: string }) =>
  Request.post("/user/info/login", params);

export const $getEexternalUser = () => Request.get("/user/info/getUserInfo");

export const $getmenus = (params: { userid: string }) =>
  Request.get("/user/info/getmenus", { params });