// Wait for the LeetCode UI to load fully before making the title clickable
function makeTitleClickable() {
  const titleEl = document.querySelector('.text-title-large') || document.querySelector('.elfjS') || document.querySelector('[data-cy="question-title"]');

  if (!titleEl) {
    // If not found, retry after a short delay
    setTimeout(makeTitleClickable, 1000);
    return;
  }

  // Prevent adding multiple listeners if already modified
  if (titleEl.hasAttribute('data-bigo-buddy-active')) return;

  titleEl.setAttribute('data-bigo-buddy-active', 'true');
  titleEl.classList.add('bigo-buddy-title');
  
  titleEl.addEventListener("click", () => {
    extractAndSendProblem();
    // Notify background script to open side panel
    chrome.runtime.sendMessage({ action: "open_side_panel" });
  });
}

function extractAndSendProblem() {
  // Extract Title
  const titleEl = document.querySelector('.text-title-large') || document.querySelector('.elfjS') || document.querySelector('[data-cy="question-title"]');
  // Sometimes the title has the emoji due to css pseudo elements or direct text, clean it up if needed, but innerText usually ignores ::after.
  const title = titleEl ? titleEl.innerText : document.title;

  // Extract Description
  const descEl = document.querySelector('[data-track-load="description_content"]');
  const description = descEl ? descEl.innerText : "";

  chrome.runtime.sendMessage({
    action: "save_problem_context",
    title: title,
    description: description
  });
}

// Initial check and observer to handle SPA navigation
setTimeout(makeTitleClickable, 2000);

// Observe DOM changes to re-inject behavior if we navigate to a new problem
const observer = new MutationObserver((mutations) => {
  const titleEl = document.querySelector('.text-title-large') || document.querySelector('.elfjS') || document.querySelector('[data-cy="question-title"]');
  if (titleEl && !titleEl.hasAttribute('data-bigo-buddy-active')) {
    makeTitleClickable();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
