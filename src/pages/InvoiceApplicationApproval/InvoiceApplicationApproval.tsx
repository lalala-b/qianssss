/* eslint-disable no-underscore-dangle */
/* eslint-disable jsx-a11y/iframe-has-title */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
// import { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router";
import qs from "qs";
import styles from "./InvoiceApplicationApproval.scss";

const MediaPaymentApproval = () => {
  const location = useLocation();
  const { businessKey = "", instanceId = "" } = qs.parse(
    location.search.split("?")[1]
  );
  return (
    <>
      <div
        className={window.__POWERED_BY_QIANKUN__ ? styles.iframeWrap : ""}
        style={{ height: "100%" }}
      >
        <iframe
          width="100%"
          height="100%"
          frameBorder="no"
          marginWidth={0}
          marginHeight={0}
          scrolling="0"
          src={`https://oa.zhuanspirit.com//oa/finance/invoice/invoiceinfo.html?infoplay=infoplay&businessKey=${businessKey}&processInstanceId=${instanceId}`}
        />
      </div>
    </>
  );
};

export default MediaPaymentApproval;
