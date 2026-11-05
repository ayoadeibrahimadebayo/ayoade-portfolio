const themeToggle = document.querySelector(".theme-toggle");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const savedTheme = localStorage.getItem("ayoade-theme");
const initialTheme = savedTheme === "dark" ? "dark" : "light";

const applyTheme = (theme) => {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  themeToggle?.setAttribute("aria-pressed", String(isDark));
  themeToggle?.setAttribute("title", `Switch to ${isDark ? "light" : "dark"} mode`);
  themeColorMeta?.setAttribute("content", isDark ? "#14151b" : "#faf9f6");
};

applyTheme(initialTheme);

themeToggle?.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("ayoade-theme", nextTheme);
  applyTheme(nextTheme);
});

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isExpanded));
    menuButton.querySelector(".sr-only").textContent = isExpanded
      ? "Open navigation menu"
      : "Close navigation menu";
    navigation.classList.toggle("is-open", !isExpanded);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.querySelector(".sr-only").textContent = "Open navigation menu";
      navigation.classList.remove("is-open");
    }
  });
}

const yearElement = document.querySelector("#current-year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const revealElements = document.querySelectorAll(
  ".section-heading, .about-intro, .detail-block, .skill-category, .contact-copy, .contact-form",
);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  revealElements.forEach((element) => {
    element.setAttribute("data-reveal", "");
    revealObserver.observe(element);
  });
}

const imageLightbox = document.querySelector("#image-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const lightboxCount = document.querySelector("#lightbox-count");
const screenGallery = document.querySelector("#screen-gallery");
const galleryImages = screenGallery
  ? Array.from(screenGallery.querySelectorAll(".gallery-trigger")).map((trigger) => {
      const image = trigger.querySelector("img");
      return {
        src: image?.src ?? "",
        alt: image?.alt ?? "",
        caption: trigger.querySelector("span")?.textContent?.trim() ?? image?.alt ?? "",
      };
    })
  : [];
let activeGalleryIndex = 0;

if (
  imageLightbox instanceof HTMLDialogElement &&
  lightboxImage instanceof HTMLImageElement &&
  lightboxCaption &&
  lightboxCount &&
  galleryImages.length > 0
) {
  const showGalleryImage = (index) => {
    activeGalleryIndex = (index + galleryImages.length) % galleryImages.length;
    const image = galleryImages[activeGalleryIndex];
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = image.caption;
    lightboxCount.textContent = `${String(activeGalleryIndex + 1).padStart(2, "0")} / ${galleryImages.length}`;
  };

  document.querySelectorAll("[data-gallery-item]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const index = Number(trigger.getAttribute("data-gallery-item"));
      if (!Number.isInteger(index) || index < 0 || index >= galleryImages.length) {
        return;
      }

      showGalleryImage(index);
      imageLightbox.showModal();
    });
  });

  document.querySelector(".lightbox-close")?.addEventListener("click", () => {
    imageLightbox.close();
  });
  document.querySelector(".lightbox-prev")?.addEventListener("click", () => {
    showGalleryImage(activeGalleryIndex - 1);
  });
  document.querySelector(".lightbox-next")?.addEventListener("click", () => {
    showGalleryImage(activeGalleryIndex + 1);
  });
  imageLightbox.addEventListener("click", (event) => {
    if (event.target === imageLightbox) {
      imageLightbox.close();
    }
  });
  imageLightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      showGalleryImage(activeGalleryIndex - 1);
    } else if (event.key === "ArrowRight") {
      showGalleryImage(activeGalleryIndex + 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      imageLightbox.close();
    }
  });
  imageLightbox.addEventListener("cancel", (event) => {
    event.preventDefault();
    imageLightbox.close();
  });
}

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

if (contactForm instanceof HTMLFormElement && formStatus) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const defaultButtonText = submitButton?.innerHTML;

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      return;
    }

    if (!(submitButton instanceof HTMLButtonElement)) {
      formStatus.textContent = "The form could not be submitted. Please email Ayoade directly.";
      formStatus.classList.add("is-error");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    formStatus.classList.remove("is-error", "is-success");
    formStatus.textContent = "Sending your message…";

    let response;
    try {
      response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });
    } catch {
      formStatus.textContent =
        "We couldn’t connect to the form service. Please try again or email ayoadeibrahimadebayo@gmail.com.";
      formStatus.classList.add("is-error");
      submitButton.disabled = false;
      submitButton.innerHTML = defaultButtonText;
      return;
    }

    if (!response.ok) {
      formStatus.textContent =
        response.status === 422
          ? "Please check your details and try again."
          : `Your message couldn’t be sent (error ${response.status}). Please try again or email ayoadeibrahimadebayo@gmail.com.`;
      formStatus.classList.add("is-error");
      submitButton.disabled = false;
      submitButton.innerHTML = defaultButtonText;
      return;
    }

    contactForm.reset();
    formStatus.textContent = "Thanks for reaching out! Your message has been sent to Ayoade.";
    formStatus.classList.add("is-success");
    submitButton.disabled = false;
    submitButton.innerHTML = defaultButtonText;
  });
}
