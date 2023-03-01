export function setCookie(name: string, val: any) {
  const d = new Date();
  let expires = "";
  d.setTime(d.getTime() + 7*24 * 60 * 60 * 1000);
  expires = `; expires=${d.toUTCString()}`;
  document.cookie = `${name}=${val}${expires}`;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getCookie(name: string) {
  let data = "";
  if (document.cookie) {
    const arr = document.cookie.split(";");
    // eslint-disable-next-line no-restricted-syntax
    for (const str of arr) {
      const temp = str.split("=");
      if (temp[0].replace(/(^\s*)/g, "") === name) {
        data = decodeURI(temp[1]);
        break;
      }
    }
  } else {
    console.warn("cookie不存在");
  }
  return data;
}

export function removeCookie(name: any) {
  const exp = new Date();
  exp.setTime(exp.getTime() - 1);
  const val = getCookie(name);
  if (val != null)
    document.cookie = `${name}=${val};expires=${exp.toUTCString()}`;
}
