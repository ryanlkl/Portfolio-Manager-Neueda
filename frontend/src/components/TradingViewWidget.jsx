// TradingViewWidget.jsx
import React, { useEffect, useRef, memo, useState } from 'react';

function getTheme() {
  if (typeof window !== "undefined") {
    return document.documentElement.getAttribute("data-bs-theme") || localStorage.getItem("theme") || "dark";
  }
  return "dark";
}

function TradingViewWidget({ ticker }) {
  const container = useRef();
  const [theme, setTheme] = useState(getTheme());

  useEffect(() => {
    const updateTheme = () => setTheme(getTheme());
    window.addEventListener("storage", updateTheme);
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-bs-theme"] });
    return () => {
      window.removeEventListener("storage", updateTheme);
      observer.disconnect();
    };
  }, []);

  useEffect(
    () => {
      if (container.current) {
        container.current.innerHTML = "";
      }

      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "allow_symbol_change": true,
          "calendar": false,
          "details": false,
          "hide_side_toolbar": true,
          "hide_top_toolbar": false,
          "hide_legend": false,
          "hide_volume": false,
          "hotlist": false,
          "interval": "D",
          "locale": "en",
          "save_image": true,
          "style": "1",
          "symbol": "NASDAQ:${ticker}",
          "theme": "${theme === "dark" ? "dark" : "light"}",
          "timezone": "Etc/UTC",
          "backgroundColor": "${theme === "dark" ? "#0F0F0F" : "#fff"}",
          "gridColor": "${theme === "dark" ? "rgba(242, 242, 242, 0.06)" : "rgba(0,0,0,0.06)"}",
          "watchlist": [],
          "withdateranges": false,
          "compareSymbols": [],
          "studies": [],
          "autosize": true
        }`;
      container.current.appendChild(script);
    },
    [ticker, theme]
  );

  return (
    <div className="container" style={{height: "300px"}}>
      <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
        <div className="tradingview-widget-copyright">
          <a href={`https://www.tradingview.com/symbols/NASDAQ-${ticker}/?exchange=NASDAQ`} rel="noopener nofollow" target="_blank"></a>
        </div>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
