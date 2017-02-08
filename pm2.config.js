module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : "Mint",
      script    : "./main.js",
      watch     : true,
      ignore_watch: ["node_modules/", "Temp/", ".git/"],
      env: {
        "PORT"          : "5000",
        "NODE_ENV"      : "development",
        "VERBOSE"       : "true",
        "API_ENDPOINT"  : "https://mintdesign.cdn.prismic.io/api",
        "ACCESS_TOKEN"  : "MC5WSGRtdUNrQUFDVUFaVHdO.We-_vT7vv73vv70N77-9eljvv73vv71977-977-9eghk77-9CO-_ve-_vQJ_77-9P--_ve-_vRrvv73vv73vv70H",
        "CLIENT_ID"     : "VHdmuCkAACgAZTwM",
        "CLIENT_SECRET" : "4ec8edc162cf4b560ba12765cafbb090",
      }
    }
  ]
}
