console.log("%c ZRLab %c https://blog.zrlab.org", "color:#fff;background:linear-gradient(to right, #0f2027, #203a43);padding:5px 0;border-radius: 3px 0 0 3px;", "color:#fff;background:linear-gradient(to right, #203a43, #2c5364);padding:5px 10px 5px 0px;border-radius: 0 3px 3px 0;");
console.log("%c Powered by %c HUGO ", "padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: #606060;", "padding: 2px 1px; border-radius: 0 3px 3px 0; color: #fff; background: #b5c4b1; ");
console.log("%c Theme by %c ConsoleX ", "padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: #606060;", "padding: 2px 1px; border-radius: 0 3px 3px 0; color: #fff; background: #b5c4b1; ");

function loadScript({
  url,
  delay,
  onloadCallback,
  async,
  preloadCallback,
  attributes = {},
}) {
  function load() {
    if (preloadCallback) preloadCallback();

    const script = document.createElement("script");
    script.src = url;
    script.async = async;

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });

    if (onloadCallback) script.onload = onloadCallback;

    document.body.appendChild(script);
  }

  if (typeof delay !== "undefined") {
    setTimeout(load, delay);
  } else {
    load();
  }
}

// Load Artalk comment service
loadScript({
  url: 'https://artalk.zrlab.org/dist/ArtalkLite.js',
  delay: 100,
  async: true,
  onloadCallback: function() {
    const atkElement = document.querySelector("#atk_comments");
    if (atkElement) {
      Artalk.init({
        el: "#atk_comments",
        server: "https://artalk.zrlab.org",
        site: "ZRLab",
        darkMode: "auto",
        pageKey: window.location.pathname.replace(/\/$/,'')
      });
      console.log("Artalk loaded");
    } else {
      console.log("No atk_comments element found, skipping Artalk initialization.");
    }
  }
});

// swup head plugin
loadScript({
  url: "https://unpkg.com/@swup/head-plugin@2",
  async: false,
  delay: 200,
  onloadCallback: function () {
    console.log("swup head plugin loaded");
  },
})

// swup preload plugin
loadScript({
  url: "https://unpkg.com/@swup/preload-plugin@3",
  async: false,
  delay: 200,
  onloadCallback: function () {
    console.log("swup preload plugin loaded")
  }
})

// swup progress bar plugin
loadScript({
  url: "https://unpkg.com/@swup/progress-plugin@3",
  async: false,
  delay: 200,
  onloadCallback: function () {
    console.log("swup progress bar plugin loaded")
  }
})

// swup
loadScript({
  url: "https://unpkg.com/swup@4",
  async: false,
  delay: 200,
  onloadCallback: function () {
    const swup = new Swup({
      containers: ["body"],
      plugins: [
        new SwupHeadPlugin(),
        new SwupPreloadPlugin({ preloadVisibleLinks: true }),
        new SwupProgressPlugin(),
      ],
      animationSelector: false,
    });
    console.log("swup loaded");

  swup.hooks.on("page:view", () => {
    // Load Artalk comment service
    const atkElement = document.querySelector("#atk_comments");
    if (atkElement) {
      loadScript({
        url: 'https://artalk.zrlab.org/dist/ArtalkLite.js',
        delay: 100,
        async: true,
        onloadCallback: function() {
          Artalk.init({
            el: "#atk_comments",
            server: "https://artalk.zrlab.org",
            site: "ZRLab",
            darkMode: "auto",
            pageKey: window.location.pathname.replace(/\/$/,'')
          });
          console.log("Artalk loaded");
        }
      });
    } else {
      console.log("No atk_comments element found, skipping Artalk initialization.");
    }
  })
  }
})
