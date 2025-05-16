// Main JavaScript file for outdoor-messer.net
// Enhanced interactivity and functionality

document.addEventListener("DOMContentLoaded", function () {
  // Initialize all functionality
  initThemeToggle();
  initMobileMenu();
  initBackToTop();
  initFAQAccordion();
  initAnimatedStats();
  initGallery();
  initScrollProgress();
  initSmoothScroll();
  initLazyLoading();
  initCookieConsent();
  registerServiceWorker();

  // Trigger animations for elements in viewport on page load
  animateElementsInViewport();
});

// Theme Toggle Functionality
function initThemeToggle() {
  const themeToggle = document.querySelector(".theme-toggle");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Check for saved theme preference or use the system preference
  const currentTheme =
    localStorage.getItem("theme") ||
    (prefersDarkScheme.matches ? "dark" : "light");

  // Set the initial theme
  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  // Toggle theme when button is clicked
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      let theme = document.documentElement.getAttribute("data-theme");

      if (theme === "dark") {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      }
    });
  }
}

// Mobile Menu Functionality
function initMobileMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("nav ul");

  // Create mobile overlay if it doesn't exist
  let mobileOverlay = document.querySelector(".mobile-overlay");
  if (!mobileOverlay && menuToggle && nav) {
    mobileOverlay = document.createElement("div");
    mobileOverlay.className = "mobile-overlay";
    document.body.appendChild(mobileOverlay);

    // Toggle menu and overlay
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("active");
      menuToggle.classList.toggle("active");
      mobileOverlay.classList.toggle("active");

      // Toggle body scroll
      if (nav.classList.contains("active")) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }

      // Set aria attributes for accessibility
      menuToggle.setAttribute(
        "aria-expanded",
        nav.classList.contains("active").toString()
      );
    });

    // Close menu when clicking on overlay
    mobileOverlay.addEventListener("click", () => {
      nav.classList.remove("active");
      menuToggle.classList.remove("active");
      mobileOverlay.classList.remove("active");
      document.body.style.overflow = "";
      menuToggle.setAttribute("aria-expanded", "false");
    });

    // Close menu when clicking on a nav link
    const navLinks = nav.querySelectorAll("a");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("active");
        menuToggle.classList.remove("active");
        mobileOverlay.classList.remove("active");
        document.body.style.overflow = "";
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }
}

// Back to Top Button Functionality
function initBackToTop() {
  const backToTopButton = document.querySelector(".back-to-top");

  if (backToTopButton) {
    const toggleBackToTopButton = () => {
      if (window.scrollY > 300) {
        backToTopButton.classList.add("visible");
      } else {
        backToTopButton.classList.remove("visible");
      }
    };

    window.addEventListener("scroll", toggleBackToTopButton);

    backToTopButton.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
}

// FAQ Accordion Functionality
function initFAQAccordion() {
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
      const answer = question.nextElementSibling;
      const isActive = question.classList.contains("active");

      // Close all answers
      document.querySelectorAll(".faq-question").forEach((q) => {
        q.classList.remove("active");
        q.setAttribute("aria-expanded", "false");
      });

      document.querySelectorAll(".faq-answer").forEach((a) => {
        a.classList.remove("active");
        a.setAttribute("aria-hidden", "true");
      });

      // Open this answer if it was closed
      if (!isActive) {
        question.classList.add("active");
        question.setAttribute("aria-expanded", "true");
        answer.classList.add("active");
        answer.setAttribute("aria-hidden", "false");
      }
    });

    // Keyboard support for FAQ questions
    question.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        question.click();
      }
    });
  });
}

// Animated Statistics Counter
function initAnimatedStats() {
  const statNumbers = document.querySelectorAll(".stat-number");

  if (statNumbers.length > 0) {
    const isInViewport = (element) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.top <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
      );
    };

    const animateStat = (statElement) => {
      if (statElement.classList.contains("animated")) return;

      const targetValue = parseInt(statElement.getAttribute("data-count"));
      const duration = 2000; // milliseconds
      const stepTime = 50; // milliseconds
      const totalSteps = duration / stepTime;
      const stepValue = targetValue / totalSteps;

      let currentValue = 0;
      let currentStep = 0;

      const counter = setInterval(() => {
        currentStep++;
        currentValue += stepValue;

        if (currentStep >= totalSteps) {
          clearInterval(counter);
          statElement.textContent = targetValue;
        } else {
          statElement.textContent = Math.round(currentValue);
        }
      }, stepTime);

      statElement.classList.add("animated");
    };

    const checkStats = () => {
      statNumbers.forEach((stat) => {
        if (isInViewport(stat) && !stat.classList.contains("animated")) {
          animateStat(stat);
        }
      });
    };

    // Initialize on scroll and on initial load
    window.addEventListener("scroll", checkStats);
    checkStats();
  }
}

// Gallery Functionality
function initGallery() {
  const galleryModal = document.getElementById("gallery-modal");
  const gallerySlides = document.getElementById("gallery-slides");
  const galleryCaption = document.getElementById("gallery-caption");
  const galleryIndicators = document.getElementById("gallery-indicators");
  const galleryPrev = document.getElementById("gallery-prev");
  const galleryNext = document.getElementById("gallery-next");
  const galleryClose = document.getElementById("gallery-close");

  if (!galleryModal) return;

  let currentSlideIndex = 0;

  // Gallery image data by product
  const galleryImages = {
    mora: [
      {
        src: "https://images.unsplash.com/photo-1554006782-a95e3428a3e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
        caption: "Mora Companion - Ideal für Outdoor-Aktivitäten",
      },
      {
        src: "https://images.unsplash.com/photo-1620286502169-94836360ca2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
        caption: "Mora Companion - Klinge im Detail",
      },
      {
        src: "https://images.unsplash.com/photo-1611025880302-cd250578c198?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
        caption: "Mora Companion im Einsatz beim Schnitzen",
      },
    ],
    opinel: [
      {
        src: "https://images.unsplash.com/photo-1566454825481-9c18dd5a3f42?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
        caption: "Opinel Nr. 8 Outdoor - Der französische Klassiker",
      },
      {
        src: "https://images.unsplash.com/photo-1622548231342-8a3bf917d861?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
        caption: "Opinel Nr. 8 - Virobloc-Sicherungsring",
      },
      {
        src: "https://images.unsplash.com/photo-1510297185329-eeaa9486a1f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
        caption: "Opinel Nr. 8 beim Outdoor-Einsatz",
      },
    ],
    buck: [
      {
        src: "https://images.unsplash.com/photo-1525103504173-8dc1582c7430?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
        caption: "Buck 110 Folding Hunter - Amerikanische Tradition",
      },
      {
        src: "https://images.unsplash.com/photo-1609089225845-040c4f16aafe?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
        caption: "Buck 110 - Detailansicht des Messers",
      },
      {
        src: "https://images.unsplash.com/photo-1638538955252-b6986e6b1b10?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
        caption: "Buck 110 - Holzgriff mit Messingbeschlägen",
      },
    ],
  };

  // Open gallery with specific product images
  const openGallery = (productId) => {
    if (!galleryImages[productId]) return;

    // Clear existing slides and indicators
    gallerySlides.innerHTML = "";
    galleryIndicators.innerHTML = "";

    // Add slides for this product
    galleryImages[productId].forEach((image, index) => {
      // Create slide
      const slide = document.createElement("div");
      slide.className = "gallery-slide";
      slide.innerHTML = `<img src="${image.src}" alt="${image.caption}">`;
      gallerySlides.appendChild(slide);

      // Create indicator
      const indicator = document.createElement("div");
      indicator.className = `gallery-indicator${index === 0 ? " active" : ""}`;
      indicator.setAttribute("aria-label", `Slide ${index + 1}`);
      indicator.setAttribute("role", "button");
      indicator.setAttribute("tabindex", "0");
      indicator.addEventListener("click", () => {
        goToSlide(index);
      });
      galleryIndicators.appendChild(indicator);
    });

    currentSlideIndex = 0;
    updateGalleryCaption();
    galleryModal.classList.add("active");

    // Prevent scrolling of body
    document.body.style.overflow = "hidden";
  };

  // Close gallery
  const closeGallery = () => {
    galleryModal.classList.remove("active");
    document.body.style.overflow = "";
  };

  // Navigate to a specific slide
  const goToSlide = (index) => {
    const slides = document.querySelectorAll(".gallery-slide");
    if (slides.length === 0) return;

    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    currentSlideIndex = index;

    // Update slide position
    gallerySlides.style.transform = `translateX(-${index * 100}%)`;

    // Update indicators
    document.querySelectorAll(".gallery-indicator").forEach((indicator, i) => {
      indicator.classList.toggle("active", i === index);
      indicator.setAttribute("aria-current", i === index ? "true" : "false");
    });

    updateGalleryCaption();
  };

  // Update caption
  const updateGalleryCaption = () => {
    const activeProduct = Object.keys(galleryImages).find((key) => {
      return gallerySlides.childElementCount === galleryImages[key].length;
    });

    if (activeProduct && galleryImages[activeProduct][currentSlideIndex]) {
      galleryCaption.textContent =
        galleryImages[activeProduct][currentSlideIndex].caption;
    }
  };

  // Event listeners for gallery
  if (galleryClose) {
    galleryClose.addEventListener("click", closeGallery);
  }

  if (galleryPrev) {
    galleryPrev.addEventListener("click", () =>
      goToSlide(currentSlideIndex - 1)
    );
  }

  if (galleryNext) {
    galleryNext.addEventListener("click", () =>
      goToSlide(currentSlideIndex + 1)
    );
  }

  // Close gallery on click outside
  galleryModal.addEventListener("click", (e) => {
    if (e.target === galleryModal) {
      closeGallery();
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!galleryModal.classList.contains("active")) return;

    if (e.key === "Escape") closeGallery();
    if (e.key === "ArrowLeft") goToSlide(currentSlideIndex - 1);
    if (e.key === "ArrowRight") goToSlide(currentSlideIndex + 1);
  });

  // Connect image overlays to gallery
  const messerCards = [
    {
      element: document.querySelector(".card:nth-of-type(1) .image-overlay"),
      product: "mora",
    },
    {
      element: document.querySelector(".card:nth-of-type(2) .image-overlay"),
      product: "opinel",
    },
    {
      element: document.querySelector(".card:nth-of-type(3) .image-overlay"),
      product: "buck",
    },
  ];

  messerCards.forEach((card) => {
    if (card.element) {
      card.element.addEventListener("click", (e) => {
        e.preventDefault();
        openGallery(card.product);
      });
    }
  });
}

// Scroll Progress Indicator
function initScrollProgress() {
  const scrollProgress = document.getElementById("scroll-progress");

  if (scrollProgress) {
    const updateScrollProgress = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      scrollProgress.style.width = `${progress}%`;
    };

    window.addEventListener("scroll", updateScrollProgress);
    window.addEventListener("resize", updateScrollProgress);
  }
}

// Smooth Scroll for Navigation Links
function initSmoothScroll() {
  document
    .querySelectorAll('a[href^="#"]:not(.back-to-top)')
    .forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId !== "#") {
          e.preventDefault();

          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition =
              elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }
        }
      });
    });
}

// Lazy Loading Images
function initLazyLoading() {
  const lazyloadImages = document.querySelectorAll("img.lazy-load");

  const lazyLoad = (target) => {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute("data-src");

          img.setAttribute("src", src);
          img.addEventListener("load", () => {
            img.classList.add("lazy-loaded");
          });

          observer.disconnect();
        }
      });
    });

    io.observe(target);
  };

  // Check if IntersectionObserver is supported
  if ("IntersectionObserver" in window) {
    lazyloadImages.forEach((image) => {
      lazyLoad(image);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    lazyloadImages.forEach((image) => {
      image.src = image.getAttribute("data-src");
      image.classList.add("lazy-loaded");
    });
  }
}

// Animate elements when they come into viewport
function animateElementsInViewport() {
  const elements = document.querySelectorAll(".animate-on-scroll");

  const isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <=
        (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
      rect.bottom >= 0
    );
  };

  const checkElements = () => {
    elements.forEach((element) => {
      if (isInViewport(element) && !element.classList.contains("animated")) {
        element.classList.add("animated");
      }
    });
  };

  window.addEventListener("scroll", checkElements);
  checkElements();
}

// Cookie Consent Banner
function initCookieConsent() {
  const cookieConsent = localStorage.getItem("cookieConsent");

  if (!cookieConsent) {
    // Create cookie banner if it doesn't exist
    const banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.innerHTML = `
      <div class="cookie-banner-content">
        <p>Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. Durch die weitere Nutzung dieser Website stimmen Sie der Verwendung von Cookies zu.</p>
      </div>
      <div class="cookie-banner-buttons">
        <button class="cookie-btn cookie-btn-accept">Akzeptieren</button>
        <button class="cookie-btn cookie-btn-settings">Einstellungen</button>
      </div>
    `;

    document.body.appendChild(banner);

    // Show banner after a short delay
    setTimeout(() => {
      banner.classList.add("visible");
    }, 1000);

    // Handle accept button
    const acceptBtn = banner.querySelector(".cookie-btn-accept");
    if (acceptBtn) {
      acceptBtn.addEventListener("click", () => {
        localStorage.setItem("cookieConsent", "accepted");
        banner.classList.remove("visible");
        setTimeout(() => {
          banner.remove();
        }, 300);
      });
    }

    // Handle settings button
    const settingsBtn = banner.querySelector(".cookie-btn-settings");
    if (settingsBtn) {
      settingsBtn.addEventListener("click", () => {
        // This would normally open cookie settings modal
        alert("Cookie-Einstellungen werden in Kürze verfügbar sein.");
      });
    }
  }
}

// Service Worker Registration
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registration successful:",
            registration.scope
          );
        })
        .catch((error) => {
          console.log("Service Worker registration failed:", error);
        });
    });
  }
}

// Helper function to format date in German style
function formatGermanDate(date) {
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  return new Date(date).toLocaleDateString("de-DE", options);
}
