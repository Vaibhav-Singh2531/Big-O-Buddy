const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Google Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.askQuestion = async (req, res) => {
  try {
    const { problemTitle, problemDescription, userQuestion } = req.body;

    if (!userQuestion) {
      return res.status(400).json({ error: "userQuestion is required" });
    }

    // Use Gemini 2.5 Flash for speed and cost effectiveness.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are BigO Buddy, an expert AI programming assistant designed to help users on LeetCode. 
    You provide helpful, concise, and accurate hints or explanations without giving away the complete solution immediately unless explicitly asked.

    Here is the problem the user is looking at:
    Title: ${problemTitle || "Unknown Problem"}
    Description:
    ${problemDescription || "No description provided."}
    
    The user is asking the following question:
    ${userQuestion}
    
    Provide a clear and helpful response. If the user asks about how to join nodes (like first odd then even), explain the process clearly. Use Markdown for formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ answer: text });
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    res.status(500).json({ error: "Failed to fetch response from AI." });
  }
};
