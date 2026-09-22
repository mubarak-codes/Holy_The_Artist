(function () {
  "use strict";

  /* =========================================================
     CONFIG
  ========================================================= */

  const STORE_URL =
    "https://flutterwave.com/store/holytheartist";

  const EMAIL =
    "mubaraktheartist@gmail.com";


  /* =========================================================
     ELEMENTS
  ========================================================= */

  const floatBack =
    document.getElementById("floatBack");

  const menuButton =
    document.getElementById("menuBtn");

  const nav =
    document.getElementById("primaryNav");

  const navClose =
    document.getElementById("navClose");

  const navBackdrop =
    document.getElementById("navBackdrop");

  const moreToggle =
    document.getElementById("moreToggle");

  const morePanel =
    document.getElementById("morePanel");


  /* =========================================================
     CATALOG
  ========================================================= */

  let originals = [];
  let prints = [];


  Promise.all([
    fetch("data/originals.json").then(function (res) {
      if (!res.ok) {
        throw new Error("Could not load originals.json");
      }

      return res.json();
    }),

    fetch("data/prints.json").then(function (res) {
      if (!res.ok) {
        throw new Error("Could not load prints.json");
      }

      return res.json();
    })
  ])
    .then(function ([originalsData, printsData]) {
      originals = Array.isArray(originalsData)
        ? originalsData
        : [];

      prints = Array.isArray(printsData)
        ? printsData
        : [];

      renderCatalog();
    })
    .catch(function (error) {
      console.error(
        "Failed to load catalog:",
        error
      );
    });


  /* =========================================================
     PRODUCT CARD
     
     Each product can have its own:
     
     "storeUrl": "https://flutterwave.com/..."
     
     If storeUrl is missing, the main store is used.
  ========================================================= */

  function pieceCard(item) {
    const element =
      document.createElement("div");

    element.className =
      "piece";

    element.setAttribute(
      "role",
      "link"
    );

    element.setAttribute(
      "tabindex",
      "0"
    );

    element.innerHTML = `
      <div class="piece-art">
        ${
          item.img
            ? `
              <img
                src="${item.img}"
                alt="${item.title || ""}"
                loading="lazy"
              >
            `
            : `
              <div class="piece-art-placeholder">
                No image available
              </div>
            `
        }
      </div>

      <div class="piece-body">
        <div class="title">
          ${item.title || ""}
        </div>

        <div class="meta">
          ${item.size || ""}
        </div>

        <div class="price">
          ${item.price || ""}
        </div>
        <div>${item.sold}</div>
      </div>
    `;


    /* =======================================================
       OPEN PRODUCT
    ======================================================= */

    function openProduct() {
      const productUrl =
        item.storeUrl ||
        item.productUrl ||
        item.url ||
        item.link ||
        STORE_URL;

      window.location.href = productUrl;
    }


    /* Click */

    element.addEventListener(
      "click",
      openProduct
    );


    /* Keyboard */

    element.addEventListener(
      "keydown",
      function (event) {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();

          openProduct();
        }
      }
    );


    return element;
  }


  /* =========================================================
     FILL PRODUCT GRID
  ========================================================= */

  function fillGrid(
    containerId,
    items,
    limit
  ) {
    const container =
      document.getElementById(
        containerId
      );

    if (!container) {
      return;
    }

    container.innerHTML = "";

    const list =
      typeof limit === "number"
        ? items.slice(0, limit)
        : items;

    list.forEach(function (item) {
      container.appendChild(
        pieceCard(item)
      );
    });
  }


  /* =========================================================
     RENDER CATALOG
  ========================================================= */

  function renderCatalog() {
    fillGrid(
      "homeOriginals",
      originals,
      2
    );

    fillGrid(
      "homePrints",
      prints,
      2
    );

    fillGrid(
      "originalsGrid",
      originals
    );

    fillGrid(
      "printsGrid",
      prints
    );
  }


  /* =========================================================
     MOBILE MENU
  ========================================================= */

  function setMenuOpen(open) {
    if (nav) {
      nav.classList.toggle(
        "open",
        open
      );
    }

    if (navBackdrop) {
      navBackdrop.classList.toggle(
        "open",
        open
      );
    }

    if (menuButton) {
      menuButton.setAttribute(
        "aria-expanded",
        open ? "true" : "false"
      );
    }

    document.body.style.overflow =
      open ? "hidden" : "";
  }


  function closeMobileMenu() {
    setMenuOpen(false);
  }


  if (menuButton) {
    menuButton.addEventListener(
      "click",
      function () {
        setMenuOpen(true);
      }
    );
  }


  if (navClose) {
    navClose.addEventListener(
      "click",
      function () {
        setMenuOpen(false);
      }
    );
  }


  if (navBackdrop) {
    navBackdrop.addEventListener(
      "click",
      function () {
        setMenuOpen(false);
      }
    );
  }


  /* =========================================================
     PAGE NAVIGATION
  ========================================================= */

  const pages =
    document.querySelectorAll(
      ".page"
    );

  const navLinks =
    document.querySelectorAll(
      "[data-nav]"
    );


  function goTo(
    id,
    updateHistory = true
  ) {
    const target =
      document.getElementById(
        "page-" + id
      );

    if (!target) {
      return;
    }


    pages.forEach(function (page) {
      page.classList.toggle(
        "active",
        page.dataset.page === id
      );
    });


    navLinks.forEach(function (link) {
      link.classList.toggle(
        "active",
        link.dataset.nav === id
      );
    });


    closeMobileMenu();


    if (morePanel) {
      morePanel.classList.remove(
        "open"
      );
    }


    if (moreToggle) {
      moreToggle.setAttribute(
        "aria-expanded",
        "false"
      );
    }


    window.scrollTo({
      top: 0,
      behavior: "auto"
    });


    if (updateHistory) {
      const newUrl =
        "#" + id;

      if (
        window.location.hash !==
        newUrl
      ) {
        history.pushState(
          { page: id },
          "",
          newUrl
        );
      }
    }


    updateBackButton();
  }


  /* =========================================================
     NAVIGATION LINKS
  ========================================================= */

  navLinks.forEach(function (link) {
    link.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        const id =
          link.dataset.nav;

        if (id) {
          goTo(id);
        }
      }
    );
  });


  /* =========================================================
     BROWSER BACK / FORWARD
  ========================================================= */

  function handleHashChange() {
    const id =
      window.location.hash
        .replace("#", "") ||
      "home";

    goTo(
      id,
      false
    );
  }


  window.addEventListener(
    "popstate",
    handleHashChange
  );


  window.addEventListener(
    "hashchange",
    handleHashChange
  );


  /* =========================================================
     FLOATING BACK BUTTON
  ========================================================= */

  function updateBackButton() {
    if (!floatBack) {
      return;
    }

    const current =
      window.location.hash
        .replace("#", "");

    if (
      current &&
      current !== "home"
    ) {
      floatBack.classList.add(
        "show"
      );
    } else {
      floatBack.classList.remove(
        "show"
      );
    }
  }


  if (floatBack) {
    floatBack.addEventListener(
      "click",
      function () {
        if (
          window.history.length > 1
        ) {
          history.back();
        } else {
          goTo("home");
        }
      }
    );
  }


  /* =========================================================
     MORE MENU
  ========================================================= */

  if (
    moreToggle &&
    morePanel
  ) {
    moreToggle.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        const isOpen =
          morePanel.classList.contains(
            "open"
          );

        morePanel.classList.toggle(
          "open",
          !isOpen
        );

        moreToggle.setAttribute(
          "aria-expanded",
          !isOpen
            ? "true"
            : "false"
        );
      }
    );
  }


  /* =========================================================
     CLOSE MORE MENU OUTSIDE
  ========================================================= */

  document.addEventListener(
    "click",
    function (event) {
      if (
        !morePanel ||
        !moreToggle
      ) {
        return;
      }

      const clickedInside =
        morePanel.contains(
          event.target
        ) ||
        moreToggle.contains(
          event.target
        );

      if (!clickedInside) {
        morePanel.classList.remove(
          "open"
        );

        moreToggle.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    }
  );


  /* =========================================================
     ESCAPE KEY
  ========================================================= */

  document.addEventListener(
    "keydown",
    function (event) {
      if (
        event.key !== "Escape"
      ) {
        return;
      }

      closeMobileMenu();

      if (morePanel) {
        morePanel.classList.remove(
          "open"
        );
      }

      if (moreToggle) {
        moreToggle.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    }
  );


  /* =========================================================
     CONTACT FORM
  ========================================================= */

  const contactForm =
    document.getElementById(
      "contactForm"
    );


  if (contactForm) {
    contactForm.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();

        const name =
          document.getElementById(
            "cName"
          )?.value.trim() || "";

        const email =
          document.getElementById(
            "cEmail"
          )?.value.trim() || "";

        const message =
          document.getElementById(
            "cMessage"
          )?.value.trim() || "";

        const subject =
          "Message from " +
          name +
          " via HOLY Store";

        const body =
          message +
          "\n\n— " +
          name +
          " (" +
          email +
          ")";

        const mailto =
          "mailto:" +
          EMAIL +
          "?subject=" +
          encodeURIComponent(
            subject
          ) +
          "&body=" +
          encodeURIComponent(
            body
          );

        const status =
          document.getElementById(
            "formStatus"
          );

        if (status) {
          status.style.display =
            "block";
        }

        window.location.href =
          mailto;
      }
    );
  }


  /* =========================================================
     INITIAL PAGE
  ========================================================= */

  const initialPage =
    window.location.hash
      .replace("#", "") ||
    "home";


  if (
    document.getElementById(
      "page-" + initialPage
    )
  ) {
    goTo(
      initialPage,
      false
    );
  } else {
    goTo(
      "home",
      false
    );
  }

})();
