// console.log('extension loaded3');
// window.webpackJsonp = [];
// // Object.freeze(window.webpackJsonp);
// console.log(window.webpackJsonp);

// function injectScript(file, node) {
//   const th = document.getElementsByTagName(node)[0];
//   const s = document.createElement('script');
//   s.setAttribute('type', 'text/javascript');
//   s.setAttribute('src', file);
//   th.prepend(s);
// }

// injectScript(chrome.runtime.getURL('js/injectedScript.js'), 'head');
// console.log('content script started');
// const script = document.createElement('script');
// script.setAttribute('type', 'text/javascript');
// script.setAttribute('src', chrome.runtime.getURL('js/injectedScript.js'));
// (document.head || document.documentElement).prepend(script);
// console.log('script injected');

function injectScript(file) {
  const script = document.createElement('script');  
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', chrome.runtime.getURL(file));
  (document.head || document.documentElement).prepend(script);
}

injectScript('js/injectedScript.js');
injectScript('js/mouseDriver.js');
injectScript('js/three.js');

console.log('injected scripts');

// window.webpackJsonp.push = function(args) {
//   Array.prototype.push.apply(this, [args]);
//   console.log('changed', args);
// }

// window.webpackJsonp.push(7);

// console.log(window.webpackJsonp);
// setTimeout(() => console.log(window.webpackJsonp), 10000);

// window.webpackJsonp.push = function(p) {
//   console.log(p);
// }
// document._3Dconnexion = function(a, b, c) {
//   console.log("succesfully replaced");
// }
// console.log(document._3Dconnexion);
// chrome.webRequest.onBeforeRequest.addListener(
//   function (details) {
//     console.log(details);
//     console.log("teeeest");
//     if (details.url == "https://cad.onshape.com/js/woolsthorpe.af87a15bcbfb7740e2a3.js")
//       return { redirectUrl: "http://www.youtube.com" };
//   },
//   { urls: ["*://cad.onshape.com/*"] },
//   ["blocking"]
// );