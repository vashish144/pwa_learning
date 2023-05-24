var deferredPrompt;

if(!window.Promise){
  window.Promise=Promise;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(function () {
      console.log("Service Worker Registered");
    })
    .catch((err) => {
      console.log(err);
    });
}

window.addEventListener("beforeinstallprompt", (event) => {
  console.log("beforeinstallprompt");
  deferredPrompt = event;
  return false;
});

// navigator.serviceWorker.getRegistrations().then(function(registrations) {
//   for(let registration of registrations) {
//    registration.unregister()
//  } })
