export function installGuidance(ua='',standalone=false){
 const ios=/iPhone|iPad|iPod/.test(ua),android=/Android/.test(ua),opera=/OPR\/|Opera/.test(ua),edge=/Edg\//.test(ua),firefox=/Firefox/.test(ua),chrome=/Chrome|Chromium/.test(ua);
 if(standalone)return 'This app is already open as an installed app. Device setup stays in this window. Keep the website shortcut if this browser does not support installation.';
 if(ios)return 'iPhone / iPad: open this address in Safari, tap Share, then Add to Home Screen and Add. Launch the new icon. A supported WebGPU browser is still required for Gemma; installing the icon does not add GPU support.';
 if(opera)return `${android?'Android Opera':'Opera / Opera GX'}: open the browser menu and look for Add to Home screen or Install. Availability varies by version. If neither is offered, save a bookmark, or open this address in Chrome or Edge to install. Use HTTPS or localhost.`;
 if(firefox)return 'Firefox: use a bookmark if no Install option is offered. For an installed app, open this address in a supported Chrome or Edge browser. WebGPU and storage support must pass the device check.';
 if(android)return 'Android: in Chrome or a compatible browser, open the three-dot menu, choose Add to Home screen → Install, then launch the icon. The browser device check must pass before downloading tools.';
 if(edge)return 'Microsoft Edge: open … → Apps → Install this site as an app, or use the installation icon in the address bar. Then launch Thread from the app shortcut.';
 if(chrome)return 'Chrome: open ⋮ → Cast, save and share → Install page as app, or use the install icon in the address bar. Menu wording can vary by version. Launch Thread from the app shortcut.';
 return 'Use the browser’s Install app or Add to Home Screen menu if available. Otherwise bookmark this address or open it in Chrome or Edge. Installation requires HTTPS or localhost and does not replace the device compatibility check.';
}
