/* eslint-disable max-len */
/* eslint-disable import/prefer-default-export */
import cs from "classnames";
import styles from "./SvgIcon.scss";

export const SvgIcon = (props: any) => {
  const { iconClass, className } = props;
  const styleExternalIcon = {
    mask: `url(${iconClass}) no-repeat 50% 50%`,
    WebkitMask: `url(${iconClass}) no-repeat 50% 50%`,
  };
  const isExternal = (path: string) => /^(https?:|mailto:|tel:)/.test(path);
  return (
    <>
      {isExternal(iconClass) ? (
        <div
          style={styleExternalIcon}
          className="svg-external-icon svg-icon"
          v-on="$listeners"
        />
      ) : (
        <>
          {iconClass === "juxing" ? (
            <img
              style={{ width: "18px", height: "18px", margin: '0 2px' }}
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAABNCAYAAADjCemwAAAACXBIWXMAAAsTAAALEwEAmpwYAAAHcGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjEtMDgtMTdUMTA6MzY6MjgrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIxLTA4LTE3VDEwOjUxOjAzKzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIxLTA4LTE3VDEwOjUxOjAzKzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjYyMzYzZDkzLTQ2ZDktNDIyMi1iNWJkLTdmNmI2MzE4MTU3NiIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjQ4MzA0MTcyLTM0YWYtMzY0MS1iNTg3LWFmMGVkMTA2MzNiZiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmI2ZDIyNWEyLWYyMzQtNGI3Zi1iZTY0LTA4OWQwMDU0ODQ2OSI+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDo1MDBiNjJiYy1hMmIxLWE4NDgtYTg3OS1lMzBkZDZmZGY5N2Y8L3JkZjpsaT4gPC9yZGY6QmFnPiA8L3Bob3Rvc2hvcDpEb2N1bWVudEFuY2VzdG9ycz4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiNmQyMjVhMi1mMjM0LTRiN2YtYmU2NC0wODlkMDA1NDg0NjkiIHN0RXZ0OndoZW49IjIwMjEtMDgtMTdUMTA6MzY6MjgrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChNYWNpbnRvc2gpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoyNDhlZmM2Yy0xNDZkLTQ0MjUtYjk0Mi03Y2E4YTczMTUyOTEiIHN0RXZ0OndoZW49IjIwMjEtMDgtMTdUMTA6Mzc6MjArMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo2MjM2M2Q5My00NmQ5LTQyMjItYjViZC03ZjZiNjMxODE1NzYiIHN0RXZ0OndoZW49IjIwMjEtMDgtMTdUMTA6NTE6MDMrMDg6MDAiIHN0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"
              alt=""
            />
          ) : (
            <svg
              className={cs("icon", styles.svgIcon, className)}
              aria-hidden="true"
            >
              <use xlinkHref={`#icon${iconClass}`} />
            </svg>
          )}

          {/* <img src={`static/media/${iconClass}.svg`} className={`${styles.svgIcon} ${className||''}`} alt="" /> */}
        </>
      )}
    </>
  );
};