/*
 * WhichAI - site configuration (v0.29.0)
 * The two values below are OWNER settings (Jack). Both are optional:
 * leave them empty and the related UI stays hidden. No other file needs
 * editing to enable them.
 *
 * 1) goatCode - REAL visit counter via GoatCounter (free, open source,
 *    no cookies, GDPR-friendly). Setup (2 minutes):
 *      a. Create a free account at https://www.goatcounter.com
 *      b. Pick a site code, e.g. "whichai" -> your dashboard becomes
 *         https://whichai.goatcounter.com
 *      c. Put that code here: goatCode: "whichai"
 *    The site then counts real visits and shows the real public total.
 *    WhichAI will not display invented numbers: the counter appears only
 *    when it can show a true value.
 *
 * 2) donateUrl - a hosted donation page. Recommended: Ko-fi
 *    (https://ko-fi.com, 0% fee on PayPal donations) or PayPal.Me
 *    (https://paypal.me). Example: "https://ko-fi.com/whichai".
 *    Do NOT put a personal IBAN here: a public IBAN invites direct-debit
 *    fraud and exposes personal data. Use a hosted page that shields it.
 */
(function () {
  "use strict";

  var Config = {
    goatCode: "whichai",   // e.g. "whichai" once the GoatCounter account exists
    donateUrl: ""   // e.g. "https://ko-fi.com/whichai"
  };

  var root = typeof window !== "undefined" ? window : globalThis;
  root.WhichAIConfig = Config;
  if (typeof module !== "undefined" && module.exports) module.exports = Config;
})();
