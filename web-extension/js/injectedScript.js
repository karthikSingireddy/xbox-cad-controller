// function replaced(e, t) {
//   console.log("succesfully replaced function");
//   e.exports = function (e) {
//     console.log("test");
//     function t(e) {
//       "undefined" != typeof console && (console.error || console.log)("[Script Loader]", e)
//     }
//     try {
//       // "undefined" != typeof execScript && "undefined" != typeof attachEvent && "undefined" == typeof addEventListener ? execScript(e) : "undefined" != typeof eval ? eval.call(null, e) : t("EvalError: No eval function available");
//     } catch (e) {
//       t(e)
//     }
//   }
// }

function replaced(e, t) {
  console.log('called replace script');
  e.exports = `
    console.log(this);
  `;
}

// _3DConnexion = function(n) {
//   console.log("constructor called");
// }

// Object.freeze(_3DConnexion);
// console.log('3dconnexion frozen', _3DConnexion)

// alert('test');

console.log('from injected script');
window.webpackJsonp = [];
console.log(window.webpackJsonp);

window.webpackJsonp.push = function (args) {
  Array.prototype.push.apply(this, [args]);

  // try {
  //   console.log(_3Dconnexion);
  // } catch (e) {
  //   if(typeof _3Dconnexion === "undefined") console.log('undef')
  //   console.log('not found yet', this.length);
  // }

  if(typeof _3Dconnexion !== "undefined") {
    console.log(_3Dconnexion, this.length);
    // _3Dconnexion = function(n) {
    //   console.log(n);
    // }
    // _3Dconnexion.prototype.connect = function() {
    //   return 1;
    // }
    _3Dconnexion = getDriver();

    // console.log(getDriver());

  }
  else {
    console.log("not found yet", this.length)
  }

  // if(this.length == 3) {
  //   console.log(this[2][1][6106]);
  //   this[2][1][6106] = replaced;
  //   console.log(this[2][1][6106]);
  // }

  // console.log('changed', args);
  // if (this.length === 1) {
  //   // console.log(this);
  //   // console.log(args[1][6105]);
  //   this[0][0] = "TEEEST";
  //   console.log(this[0]);
  //   this[0][1][6105] = replaced; 
  // }

  // if(this.length != 0) {
  //   Array.prototype.push.apply(this, [args]);
  // }
  // else {

  //   console.log('replacing script');
  //   args[1][6105] = replaced;
  //   Array.prototype.push.apply(this, [args]);
  // }

  return this.length;
}



// function runScript() {
//   let obj = {};
//   window.webpackJsonp[0][1][6105](obj);

//   const func = obj.exports;

//   func(script);

// }
// console.log(_3Dconnexion);



// var _3DConnexion;
// console.log("declared 3dcon")

setTimeout(() => console.log(_3Dconnexion), 5000);


// while(true) {
//   try {
//     console.log(_3Dconnexion);
//   }
//   catch(e) {
//     // console.log("not found yet");
//   }
// }






// const script = `

// console.log(this);
// _3DConnexion = function(n) {
//   console.log(n);
// }
// `;



// runScript();