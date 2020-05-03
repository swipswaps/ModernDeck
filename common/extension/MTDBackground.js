/*
	MTDBackground.js
	Copyright (c) 2014-2020 dangered wolf, et al

	Released under the MIT licence
*/

var browser = browser || chrome;

if (browser !== "undefined") {

	browser.webRequest.onHeadersReceived.addListener((details) => {
		if (details.type !== "main_frame" && details.type !== "sub_frame") {
			return;
		}

		for (i = 0; i < details.responseHeaders.length; i++) {
			if (typeof details.responseHeaders[i].name !== "undefined" && details.responseHeaders[i].name === "content-security-policy") {
				details.responseHeaders[i].value = "default-src 'self'; connect-src *; font-src https: data: blob: *; frame-src https:; frame-ancestors 'self' https:; img-src https: data: blob:; media-src *; object-src 'self' https: data: blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://c6.patreon.com https://moderndeck.org https://sentry.io https://cdn.jsdelivr.net https://ajax.googleapis.com https://cdn.ravenjs.com/ https://*.twitter.com https://*.twimg.com https://api-ssl.bitly.com; style-src 'self' 'unsafe-inline' https:;";
				return {responseHeaders:details.responseHeaders};
			}
		}

	}, {urls:["https://tweetdeck.twitter.com/*","https://twitter.com/i/cards/*"]}, ["responseHeaders","blocking"]);

	browser.webRequest.onBeforeRequest.addListener((details) => {

		if (details.url.indexOf(".css") > -1 && (details.url.indexOf("bundle") > -1 && details.url.indexOf("dist") > -1)) {
			return {cancel:true};
		}

		if (details.url.indexOf(".css") > -1 && (details.url.indexOf("tfw/css") > -1 && details.url.indexOf("tweetdeck_bundle") > -1)) {
			return ({redirectURL:browser.runtime.getURL("sources/cssextensions/twittercard.css")});
		}

		return;
	}, {urls:["https://ton.twimg.com/*"]}, ["blocking","requestBody"]);

	browser.runtime.onMessage.addListener((m) => {
		console.log("Message received");
		console.log(m);
		if (m == "getStorage") {
			browser.storage.local.get(null, (items) => {
				browser.tabs.query({url: "https://tweetdeck.twitter.com/"}, (tabs) => {
					if (typeof tabs[0] !== "undefined") {
						browser.tabs.sendMessage(tabs[0].id, {"name": "sendStorage", "storage": JSON.stringify(items)});
					} else {
						browser.tabs.sendMessage(tabs.id, {"name": "sendStorage", "message": JSON.stringify(items)});
					}
					console.log("Reply sent");
					console.log(items);
				});
			});
		} else if (m.name == "setStorage") {
			browser.storage.local.set(m.content);
		}
	});
}