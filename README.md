# Big-O Buddy 🤖
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/Vaibhav-Singh2531/Big-O-Buddy)

Big-O Buddy is an AI-powered LeetCode assistant designed to help you solve problems without just giving you the answer. It integrates directly into the LeetCode website as a Chrome Extension, providing a side-panel chat interface to ask for hints and explanations about the problem you're currently working on.

## Features

- **Seamless LeetCode Integration:** Automatically enhances LeetCode problem pages. Simply click the problem title to launch the assistant.
- **Context-Aware Assistance:** Big-O Buddy automatically knows which problem you're on, using the title and description as context for more relevant AI responses.
- **Powered by Google Gemini:** Utilizes the fast and efficient `gemini-2.5-flash` model to provide quick and helpful guidance.
- **Interactive Chat Interface:** A clean, persistent chat panel lets you have a conversation about the problem and ask follow-up questions.
- **Guides, Doesn't Spoil:** The AI is prompted to act as a helpful tutor, guiding you toward the solution rather than spoiling the problem-solving experience.

## Installation and Setup

Big-O Buddy consists of a local backend server and a frontend Chrome extension. You'll need to set up both.

### Part 1: Backend Server Setup

The backend server handles communication with the Google Gemini API.

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Vaibhav-Singh2531/Big-O-Buddy.git
    cd Big-O-Buddy
    ```

2.  **Navigate to the `server` directory:**
    ```sh
    cd server
    ```

3.  **Install dependencies:**
    ```sh
    npm install
    ```

4.  **Create an environment file:**
    Create a new file named `.env` in the `server` directory.

5.  **Add your API Key:**
    Obtain a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey) and add it to your `.env` file:
    ```
    GEMINI_API_KEY=YOUR_GOOGLE_AI_KEY
    ```

6.  **Start the server:**
    ```sh
    node server.js
    ```
    The server will start running on `http://localhost:3000`. Keep this terminal window open.

### Part 2: Frontend Chrome Extension Installation

1.  Open Google Chrome and navigate to the extensions page by typing `chrome://extensions` in the address bar.
2.  Enable **Developer mode** using the toggle in the top-right corner.
3.  Click the **Load unpacked** button that appears.
4.  In the file selection dialog, navigate to and select the `frontend/leetcode-helper` directory from the cloned project.
5.  The "BigO Buddy" extension will now be installed. You can pin it to your toolbar for easy access.

## How to Use

1.  Ensure your local backend server (from Part 1) is running.
2.  Navigate to any problem page on LeetCode (e.g., `https://leetcode.com/problems/two-sum/`).
3.  Hover over the problem's title. You'll see a 🤖 emoji appear, and your cursor will change.
4.  Click the problem title to open the Big-O Buddy side panel.
5.  The panel will load with the context of the current problem.
6.  Ask your question in the chat box and hit Send!

## Tech Stack

-   **Backend:** Node.js, Express.js
-   **Frontend:** JavaScript (Chrome Extension APIs), HTML, CSS
-   **AI:** Google Gemini API