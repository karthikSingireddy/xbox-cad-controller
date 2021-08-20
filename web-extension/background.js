
chrome.runtime.onInstalled.addListener(() => {
  alert('extension just installed');
  console.log("TEEEEEEEEEEEEEEEEEEST");
});

console.log('hello');
// alert('test');
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    console.log("teeeest");
    if (details.url == "https://cad.onshape.com/js/vendor-bundle.af87a15bcbfb7740e2a3.js")
      return { redirectUrl: "http://www.youtube.com" };
  },
  { urls: ["*://*.onshape.com/"] },
  ["blocking"]
);