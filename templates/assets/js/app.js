(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE_KEY = "rhine-theme";

  /* 主题切换 */
  var themeToggle = document.querySelector("[data-theme-toggle]");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {}
    });
  }

  /* 移动端导航 */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    Array.prototype.forEach.call(nav.querySelectorAll("a"), function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  var prose = document.querySelector("[data-prose]");

  /* 阅读时长 */
  var reading = document.querySelector("[data-reading-time]");
  if (prose && reading) {
    var text = prose.textContent || "";
    var cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    var words = text
      .replace(/[\u4e00-\u9fa5]/g, " ")
      .split(/\s+/)
      .filter(Boolean).length;
    var minutes = Math.max(1, Math.round(cjk / 400 + words / 220));
    reading.textContent =
      minutes + " " + (reading.getAttribute("data-label") || "MIN READ");
  }

  /* 代码复制 */
  if (prose) {
    Array.prototype.forEach.call(prose.querySelectorAll("pre"), function (pre) {
      var code = pre.querySelector("code");
      if (!code) {
        return;
      }
      var button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.textContent = "COPY";
      var reset = function () {
        window.setTimeout(function () {
          button.textContent = "COPY";
        }, 1600);
      };
      button.addEventListener("click", function () {
        var value = code.innerText;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(function () {
            button.textContent = "COPIED";
            reset();
          }, function () {
            button.textContent = "COPY";
          });
        } else {
          var area = document.createElement("textarea");
          area.value = value;
          area.setAttribute("readonly", "");
          area.style.position = "fixed";
          area.style.opacity = "0";
          document.body.appendChild(area);
          area.select();
          try {
            document.execCommand("copy");
            button.textContent = "COPIED";
          } catch (e) {
            button.textContent = "COPY";
          }
          document.body.removeChild(area);
          reset();
        }
      });
      pre.appendChild(button);
    });
  }

  /* 目录与滚动高亮 */
  var toc = document.querySelector("[data-toc]");
  var tocList = document.querySelector("[data-toc-list]");
  if (prose && toc && tocList) {
    var headings = Array.prototype.filter.call(
      prose.querySelectorAll("h2, h3"),
      function (heading) {
        return heading.textContent.trim().length > 0;
      }
    );

    if (headings.length < 2) {
      toc.hidden = true;
    } else {
      headings.forEach(function (heading, index) {
        if (!heading.id) {
          heading.id = "section-" + (index + 1);
        }
        var link = document.createElement("a");
        link.href = "#" + heading.id;
        link.textContent = heading.textContent;
        link.setAttribute("data-level", heading.tagName === "H3" ? "3" : "2");
        tocList.appendChild(link);
      });

      toc.hidden = false;

      var links = tocList.querySelectorAll("a");
      var setActive = function (id) {
        Array.prototype.forEach.call(links, function (link) {
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === "#" + id
          );
        });
      };

      if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                setActive(entry.target.id);
              }
            });
          },
          { rootMargin: "-88px 0px -70% 0px", threshold: 0 }
        );
        headings.forEach(function (heading) {
          observer.observe(heading);
        });
      }
    }
  }
})();
