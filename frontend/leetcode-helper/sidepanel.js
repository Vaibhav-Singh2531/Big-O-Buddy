document.addEventListener("DOMContentLoaded", () => {
  const chatHistory = document.getElementById("chat-history");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const problemContextEl = document.getElementById("problem-context");

  let currentProblemTitle = "";
  let currentProblemDescription = "";

  // Fetch current context from local storage
  chrome.storage.local.get(["problemTitle", "problemDescription"], (result) => {
    if (result.problemTitle) {
      currentProblemTitle = result.problemTitle;
      currentProblemDescription = result.problemDescription;
      problemContextEl.innerText = `Context: ${currentProblemTitle}`;
    } else {
      problemContextEl.innerText = "No problem context found. Please click 'Ask BigO Buddy' on a LeetCode problem.";
    }
  });

  // Listen for storage changes in case user navigates to a new problem
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local") {
      if (changes.problemTitle) {
        currentProblemTitle = changes.problemTitle.newValue;
        problemContextEl.innerText = `Context: ${currentProblemTitle}`;
      }
      if (changes.problemDescription) {
        currentProblemDescription = changes.problemDescription.newValue;
      }
    }
  });

  sendBtn.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, "user");
    userInput.value = "";
    
    // Add loading indicator
    const loadingId = addMessage("Thinking...", "ai", true);

    try {
      const response = await fetch("http://localhost:3000/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          problemTitle: currentProblemTitle,
          problemDescription: currentProblemDescription,
          userQuestion: text
        })
      });

      const data = await response.json();
      removeMessage(loadingId);
      
      if (data.answer) {
        // Format markdown very simply for now or just output text
        addMessage(data.answer, "ai");
      } else if (data.error) {
        addMessage(`Error: ${data.error}`, "ai");
      }
    } catch (error) {
      removeMessage(loadingId);
      addMessage("Failed to connect to the BigO Buddy server. Ensure the local backend is running.", "ai");
      console.error(error);
    }
  }

  function addMessage(text, sender, isLoading = false) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}-message`;
    const id = "msg-" + Date.now();
    msgDiv.id = id;
    
    // Quick basic formatting for code blocks and bold text (since Gemini returns Markdown)
    let formattedText = text
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');

    msgDiv.innerHTML = formattedText;
    
    if (isLoading) {
      msgDiv.style.opacity = "0.6";
    }

    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    return id;
  }

  function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
});
