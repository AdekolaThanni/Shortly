// DOM elements
const hamburger = document.getElementById("hamburger");
const menu = document.getElementById("menu");
const urlForm = document.getElementById("urlForm");
const urlInput = document.getElementById("urlInput");
const feedbackMessage = document.getElementById("feedbackMessage");
const linksDiv = document.getElementById("linksDiv");

// Show menu on hamburger clicked
hamburger.addEventListener("click", (event) => {
  const hamburgerClasses = event.currentTarget.classList;
  const menuClasses = menu.classList;
  hamburgerClasses.toggle("menuClosed");
  hamburgerClasses.toggle("menuOpened");

  if (hamburgerClasses.contains("menuClosed")) {
    menuClasses.add("opacity-0");
    return;
  }
  menuClasses.remove("opacity-0");
});

// Get previously shortened links
const shortenedLinks = JSON.parse(localStorage.getItem("shortenedLinks")) || [];

// Add previously shortened links to DOM
linksDiv.insertAdjacentHTML(
  "afterbegin",
  shortenedLinks
    .map(
      ({ urlLink, shortenedLink }) => `<div
            class="bg-white tablet:px-4 py-3 tablet:items-center rounded-md flex flex-col justify-between tablet:flex-row"
          >
            <p
              class="px-4 border-b max-w-[500px] text-ellipsis overflow-x-hidden pb-2 mb-2 border-gray tablet:p-0 tablet:mb-0 tablet:border-none"
            >
              ${urlLink}
            </p>
            <div
              class="flex flex-col gap-3 tablet:items-center tablet:flex-row px-4 tablet:px-0"
            >
              <p class="!text-cyan">${shortenedLink}</p>
              <button class="primary-button rounded-sm copy-button">Copy</button>
            </div>
          </div>`
    )
    .join("")
);

// Feedback
const showFeedback = (message, type = "pending") => {
  feedbackMessage.innerHTML = message;
  if (feedbackMessage.classList.contains("hidden")) {
    feedbackMessage.classList.remove("hidden");
  }
  if (type === "success") {
    feedbackMessage.classList.remove("!text-yellow-500");
    feedbackMessage.classList.add("!text-green-500");
  }
  if (type === "pending") {
    feedbackMessage.classList.add("!text-yellow-500");
  }
  if (type === "error") {
    feedbackMessage.classList.remove("!text-yellow-500");
    feedbackMessage.classList.add("!text-red");
  }
};

// Shorten link function
const shortenLink = async (urlLink) => {
  try {
    showFeedback("Shortening link");
    const response = await fetch(
      `https://api.shrtco.de/v2/shorten?url=${urlLink}`
    );

    if (!response.ok) throw new Error("Please check your link");

    const data = await response.json();
    showFeedback("Shortening successful!", "success");
    const shortenedLink = data.result.full_short_link;

    // Add data to DOM
    const newLink = `<div
            class="bg-white tablet:px-4 py-3 tablet:items-center rounded-md flex flex-col justify-between tablet:flex-row"
          >
            <p
              class="px-4 border-b max-w-[500px] text-ellipsis overflow-x-hidden pb-2 mb-2 border-gray tablet:p-0 tablet:mb-0 tablet:border-none"
            >
              ${urlLink}
            </p>
            <div
              class="flex flex-col gap-3 tablet:items-center tablet:flex-row px-4 tablet:px-0"
            >
              <p class="!text-cyan">${shortenedLink}</p>
              <button class="primary-button rounded-sm copy-button">Copy</button>
            </div>
          </div>`;
    linksDiv.insertAdjacentHTML("afterbegin", newLink);

    // Save link to localStorage
    shortenedLinks.unshift({ urlLink, shortenedLink });
    localStorage.setItem("shortenedLinks", JSON.stringify(shortenedLinks));
  } catch (error) {
    showFeedback(error.message, "error");
  }
};

// Copy shortened link to click board
linksDiv.addEventListener("click", function (event) {
  const btn = event.target;
  if (!btn.classList.contains("copy-button")) return;
  const linkText = btn.previousElementSibling.textContent;
  navigator.clipboard.writeText(linkText.trim());
  btn.classList.add("link-copied");
  btn.textContent = "Copied!";
});
urlForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const urlLink = urlInput.value;
  if (!urlLink.trim().length) {
    showFeedback("Please provide a link", "error");
    urlInput.classList.add("red-border");
    return;
  }

  feedbackMessage.classList.add("hidden");
  feedbackMessage.classList.remove("!text-yellow-500");
  feedbackMessage.classList.remove("!text-green-900");
  feedbackMessage.classList.remove("!text-red");
  urlInput.classList.remove("red-border");
  shortenLink(urlLink);
});
