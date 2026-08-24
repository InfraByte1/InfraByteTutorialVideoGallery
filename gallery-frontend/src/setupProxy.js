const { createProxyMiddleware } = require("http-proxy-middleware");

// Dev-only: the "dev" REACT_APP_ENVIRONMENT points apiBaseUrl at this same
// host through the relative "/api-proxy" prefix (see config.js) so browser
// requests stay same-origin to localhost:3000. The CRA dev server then
// proxies them server-to-server, which isn't subject to CORS at all —
// works around the API's CORS headers being missing on non-2xx responses.
module.exports = function (app) {
  app.use(
    "/api-proxy",
    createProxyMiddleware({
      target: "https://api.staging.infrabyte.com.au",
      changeOrigin: true,
      pathRewrite: { "^/api-proxy": "/api" },
    }),
  );
};
