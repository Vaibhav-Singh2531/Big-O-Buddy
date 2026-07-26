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

// Inject a script to the main world to access Monaco Editor
function injectMainWorldScript() {
  if (document.getElementById('bigo-buddy-injected-script')) return;
  const script = document.createElement('script');
  script.id = 'bigo-buddy-injected-script';
  script.textContent = `
    window.addEventListener("message", (event) => {
      if (event.source !== window) return;
      if (event.data.type === "BIGO_GET_CODE") {
        if (window.monaco && window.monaco.editor) {
          const models = window.monaco.editor.getModels();
          if (models.length > 0) {
            window.postMessage({ 
              type: "BIGO_CODE_RESULT", 
              code: models[0].getValue(), 
              language: models[0].getLanguageId() 
            }, "*");
          }
        }
      } else if (event.data.type === "BIGO_SET_CODE") {
        if (window.monaco && window.monaco.editor) {
          const models = window.monaco.editor.getModels();
          if (models.length > 0) {
            models[0].setValue(event.data.code);
          }
        }
      }
    });
  `;
  document.documentElement.appendChild(script);
}

// Add Debug Print Button next to the format button
function injectDebugButton() {
  if (document.querySelector('.bigo-debug-btn')) return;

  let formatButton = document.querySelector('button[aria-label="Format Document"]') || 
                     document.querySelector('button[data-tippy-content*="Format"]') ||
                     Array.from(document.querySelectorAll('button')).find(btn => 
                        (btn.getAttribute('data-tippy-content') || '').includes('Format') || 
                        (btn.getAttribute('aria-label') || '').includes('Format')
                     );

  let toolbar = formatButton ? formatButton.parentElement : null;

  if (!toolbar) {
    const monaco = document.querySelector('.monaco-editor');
    if (monaco) {
      let current = monaco;
      for (let i = 0; i < 6; i++) {
        if (!current) break;
        if (current.parentElement) {
           const potentialToolbars = current.parentElement.querySelectorAll('.flex');
           for (const t of potentialToolbars) {
              const buttons = Array.from(t.children).filter(c => c.tagName === 'BUTTON' || (c.tagName === 'DIV' && c.querySelector('svg')));
              if (buttons.length >= 4 && t.querySelector('svg')) {
                  toolbar = t;
                  formatButton = toolbar.firstElementChild;
                  break;
              }
           }
        }
        if (toolbar) break;
        current = current.parentElement;
      }
    }
  }

  if (!toolbar) {
      const flexContainers = document.querySelectorAll('.flex, [style*="display: flex"]');
      for (const container of flexContainers) {
          const btns = Array.from(container.children).filter(c => c.tagName === 'BUTTON' || c.tagName === 'DIV');
          if (btns.length >= 4 && btns.length <= 8 && Array.from(btns).some(b => b.querySelector('svg'))) {
              toolbar = container;
              formatButton = toolbar.firstElementChild;
              break;
          }
      }
  }

  if (!toolbar) return;

  const debugBtn = document.createElement('button');
  debugBtn.className = (formatButton && formatButton.className) ? formatButton.className : 'flex items-center justify-center p-1 hover:bg-fill-3 rounded';
  debugBtn.classList.add('bigo-debug-btn');
  debugBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M19 8h-1.81a5.985 5.985 0 0 0-1.82-3.32l1.41-1.41a1 1 0 0 0-1.41-1.42L14.1 3.1A5.94 5.94 0 0 0 12 2.5c-.75 0-1.47.14-2.14.39L8.68 1.71a1 1 0 0 0-1.41 1.42l1.41 1.41A5.985 5.985 0 0 0 6.81 8H5a1 1 0 0 0 0 2h1.09c-.05.33-.09.66-.09 1v1H4a1 1 0 0 0 0 2h2v1c0 .34.04.67.09 1H5a1 1 0 0 0 0 2h1.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H19a1 1 0 0 0 0-2h-1.09c.05-.33.09-.66.09-1v-1h2a1 1 0 0 0 0-2h-2v-1c0-.34-.04-.67-.09-1H19a1 1 0 0 0 0-2zm-6 8h-2v-2h2v2zm0-4h-2V8h2v4z"></path></svg>`;
  debugBtn.title = "Add Debug Prints";
  debugBtn.style.color = "#10b981"; // green to stand out slightly
  debugBtn.style.marginRight = "8px"; // add spacing

  debugBtn.addEventListener('click', () => {
    debugBtn.style.opacity = "0.5";
    window.postMessage({ type: "BIGO_GET_CODE" }, "*");
  });

  toolbar.insertBefore(debugBtn, formatButton || toolbar.firstElementChild);
}

// Listen for the code result from the injected script
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data.type === "BIGO_CODE_RESULT") {
    const { code, language } = event.data;
    
    // Send to backend
    fetch("http://localhost:3000/api/add-debug-prints", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code, language })
    })
    .then(res => res.json())
    .then(data => {
      if (data.code) {
        window.postMessage({ type: "BIGO_SET_CODE", code: data.code }, "*");
      } else {
        console.error("No code returned from backend", data);
      }
    })
    .catch(err => {
      console.error("Failed to add debug prints:", err);
    })
    .finally(() => {
      const debugBtn = document.querySelector('.bigo-debug-btn');
      if (debugBtn) debugBtn.style.opacity = "1";
    });
  }
});

// Initial check and observer to handle SPA navigation
setTimeout(makeTitleClickable, 2000);
injectMainWorldScript();

// Observe DOM changes to re-inject behavior if we navigate to a new problem
const observer = new MutationObserver((mutations) => {
  const titleEl = document.querySelector('.text-title-large') || document.querySelector('.elfjS') || document.querySelector('[data-cy="question-title"]');
  if (titleEl && !titleEl.hasAttribute('data-bigo-buddy-active')) {
    makeTitleClickable();
  }
  
  injectDebugButton();
});

observer.observe(document.body, { childList: true, subtree: true });
