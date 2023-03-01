/* eslint-disable max-len */
/* eslint-disable css-modules/no-unused-class */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Image, Popover } from "antd";

interface VideoInfoPropType {
  info: any;
  showPopver?: boolean;
}

const VideoInfo: React.FC<VideoInfoPropType> = ({
  info,
  showPopver = true,
}) => {
  const getAddTime = (dateTime: number) => {
    const date = new Date(dateTime);
    return `${date.getFullYear()}-${
      (date.getMonth() + 1).toString().length < 2 ? "0" : ""
    }${date.getMonth() + 1}-${
      date.getDate().toString().length < 2 ? "0" : ""
    }${date.getDate()} ${
      date.getHours().toString().length < 2 ? "0" : ""
    }${date.getHours()}:${
      date.getMinutes().toString().length < 2 ? "0" : ""
    }${date.getMinutes()}:${
      date.getSeconds().toString().length < 2 ? "0" : ""
    }${date.getSeconds()}`;
  };
  const renderVideoMsg = () => (
    <div>
      {info?.isDeleted === 1 ? (
        <a>
          {info?.isDeleted === 1 ? "(已删除)" : ""}
          {info.titleName}
        </a>
      ) : (
        <a href={info.url} target={info.url ? "_blank" : ""} rel="noreferrer">
          {info.titleName || info.title}
        </a>
      )}
      <p>
        {info.duration ? (
          <span>视频时长：{Math.round(info.duration)}s</span>
        ) : (
          ""
        )}
        {info.addTime ? (
          <span>
            发布时间：
            {typeof info.addTime === "number"
              ? getAddTime(info.addTime)
              : info.addTime}
          </span>
        ) : (
          ""
        )}
      </p>
    </div>
  );
  return (
    <>
      <a
        href={info.url}
        //   className="video-info-coverImg flex flex-align-center"
        target={info.url ? "_blank" : ""}
        rel="noreferrer"
      >
        {/* {info.isDelete === 1 ? (
            <div className="img-layer flex flex-justify-center">已删除</div>
          ) : (
            ""
          )} */}

        {showPopver ? (
          <Popover content={renderVideoMsg}>
            <Image
              width={60}
              preview={false}
              src={info.videoCoverUrl}
              fallback="data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAGwAAACtCAYAAABV0prcAAAACXBIWXMAAAsTAAALEwEAmpwYAAAGDmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjEtMDctMjBUMTQ6NDI6MTQrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIxLTA3LTIwVDIxOjA4OjU1KzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIxLTA3LTIwVDIxOjA4OjU1KzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6Mzg2MDVlNzItZjQzMi05ODRmLThmY2YtMTU2MmY5M2ZjOTI4IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjE5YzA4NjQzLWUxOWMtNGJmYS04NzAzLWI4YTdjMGI1ZWExYSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6N2Q3ZTQ3NDgtM2Y0MS05NjQwLTlhZTAtNmE5Mjg1MTAyYmQwIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiZjg1MzI2Ni05NWMyLTQ4MzgtYjdjNC1hYWM3YmM4YTdmZWQiIHN0RXZ0OndoZW49IjIwMjEtMDctMjBUMTQ6NDI6MTQrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChNYWNpbnRvc2gpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoxOWMwODY0My1lMTljLTRiZmEtODcwMy1iOGE3YzBiNWVhMWEiIHN0RXZ0OndoZW49IjIwMjEtMDctMjBUMjE6MDg6NTUrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PiGnfRYAAAwSSURBVHic7Z1/jBxlGce/z/vO7N7RdO8EqvYnbSmQVkkhiqaEgFXUiEjUkEhCRBFCREkI/AGEKBqJQmKIRE0U0IQfRmKIFGMg+IuKtUHFhF9S+ZEeLUJb0qOUwt3e7sy8j3/MvNu56d7t7t3ebJ7m+SST25t5Z+bd+cz7vs/7zru7xMxQ5GAGnQGlN1SYMFSYMFSYMFSYMFSYMFSYMFSYMFSYMFSYMFSYMFSYMFSYMFSYMFSY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"
            />
          </Popover>
        ) : (
          <Image
            width={60}
            preview={false}
            src={info.videoCoverUrl}
            fallback="data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAGwAAACtCAYAAABV0prcAAAACXBIWXMAAAsTAAALEwEAmpwYAAAGDmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjEtMDctMjBUMTQ6NDI6MTQrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIxLTA3LTIwVDIxOjA4OjU1KzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIxLTA3LTIwVDIxOjA4OjU1KzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6Mzg2MDVlNzItZjQzMi05ODRmLThmY2YtMTU2MmY5M2ZjOTI4IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjE5YzA4NjQzLWUxOWMtNGJmYS04NzAzLWI4YTdjMGI1ZWExYSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6N2Q3ZTQ3NDgtM2Y0MS05NjQwLTlhZTAtNmE5Mjg1MTAyYmQwIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiZjg1MzI2Ni05NWMyLTQ4MzgtYjdjNC1hYWM3YmM4YTdmZWQiIHN0RXZ0OndoZW49IjIwMjEtMDctMjBUMTQ6NDI6MTQrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChNYWNpbnRvc2gpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoxOWMwODY0My1lMTljLTRiZmEtODcwMy1iOGE3YzBiNWVhMWEiIHN0RXZ0OndoZW49IjIwMjEtMDctMjBUMjE6MDg6NTUrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PiGnfRYAAAwSSURBVHic7Z1/jBxlGce/z/vO7N7RdO8EqvYnbSmQVkkhiqaEgFXUiEjUkEhCRBFCREkI/AGEKBqJQmKIRE0U0IQfRmKIFGMg+IuKtUHFhF9S+ZEeLUJb0qOUwt3e7sy8j3/MvNu56d7t7t3ebJ7m+SST25t5Z+bd+cz7vs/7zru7xMxQ5GAGnQGlN1SYMFSYMFSYMFSYMFSYMFSYMFSYMFSYMFSYMFSYMFSYMFSYMFSYMFSY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"
          />
        )}
      </a>

      {/* {showVideoMsg ? (
        <div className="video-info-right">
          {info?.isDeleted === 1 ? (
            <a className="video-info-right__title" onClick={handleUrlClick}>
              {info?.isDeleted === 1 ? "(已删除)" : ""}
              {info.titleName}
            </a>
          ) : (
            <a
              href={info.url}
              target={info.url ? "_blank" : ""}
              className="video-info-right__title"
              onClick={handleUrlClick}
              rel="noreferrer"
            >
              {info.titleName}
            </a>
          )}
          <p>
            {info.duration ? (
              <span>视频时长：{Math.round(info.duration)}s</span>
            ) : (
              ""
            )}
            {info.addTime ? <span>发布时间：{info.addTime}</span> : ""}
          </p>
        </div>
      ) : (
        ""
      )} */}
    </>
  );
};

export default VideoInfo;
