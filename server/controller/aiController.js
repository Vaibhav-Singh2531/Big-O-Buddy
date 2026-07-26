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
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

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

exports.addDebugPrints = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `You are an expert programmer. I will give you some ${language || 'programming'} code. 
    Your task is to add print/log statements to all meaningful places in the code (like inside loops, at the start of functions, before returning) to make debugging easy. 
    Output ONLY the modified code, no markdown formatting like \`\`\`cpp or \`\`\`python, and no explanations. Just the raw code.
    Here is the code:
    ${code}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // clean up markdown if any
    if(text.startsWith('```')) {
      const lines = text.split('\n');
      if (lines.length > 2) {
        text = lines.slice(1, -1).join('\n');
      }
    }

    res.json({ code: text.trim() });
  } catch (error) {
    console.error("Error generating debug code:", error);
    res.status(500).json({ error: "Failed to fetch response from AI." });
  }
};
