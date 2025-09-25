const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Dummy AI
exports.getDummyIdeas = async (req, res) => {
  try {
    const { prompt } = req.body;
    const ideas = [
      `💡 Dummy Idea 1 for: ${prompt}`,
      `💡 Dummy Idea 2 for: ${prompt}`,
      `💡 Dummy Idea 3 for: ${prompt}`,
    ];
    res.json({ success: true, source: "dummy", prompt, ideas });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Real AI
exports.getRealIdeas = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: "Prompt is required" });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI assistant for project management ideas." },
        { role: "user", content: prompt },
      ],
      max_tokens: 100,
    });

    const aiText = response.choices[0].message.content;

    res.json({
      success: true,
      source: "openai",
      prompt,
      ideas: aiText.split("\n").filter(Boolean),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
