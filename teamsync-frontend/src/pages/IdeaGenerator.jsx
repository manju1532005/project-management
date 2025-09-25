import React, { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Button from "../components/Button.jsx";
import { useTasks } from "../context/TaskContext.jsx";

// fallback canned ideas if API fails
const canned = (topic) => {
  const t = (topic || "team productivity").trim();
  return [
    { title: `Daily 15-min standup for ${t}`, description: `Short async or live updates to unblock work for ${t}.` },
    { title: `Auto-tag tasks by priority`, description: `Use simple rules (title keywords) to set priority & route.` },
    { title: `Retro board every Friday`, description: `Collect wins, pains, and experiments; convert to tasks.` },
    { title: `Template library for ${t}`, description: `Reusable checklists and SOPs; reduce cognitive load.` },
  ];
};

export default function IdeaGenerator() {
  const [prompt, setPrompt] = useState("");
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState(""); 
  const { addTask } = useTasks();

  
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/real", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data.success && data.ideas?.length) {
        const parsedIdeas = data.ideas.map((line, idx) => ({
          title: line.replace(/^[-•\d.]\s*/, "") || `Idea ${idx + 1}`,
          description: `Generated idea for: ${prompt}`,
        }));
        setIdeas(parsedIdeas);
        setSource("openai");
      } else {
        setIdeas(canned(prompt));
        setSource("fallback");
      }
    } catch (err) {
      console.error("AI fetch error:", err);
      setIdeas(canned(prompt));
      setSource("fallback");
    } finally {
      setLoading(false);
    }
  };

  const addToBoard = (idea) => {
    addTask({ title: idea.title, description: idea.description, priority: "medium" });
  };

  const handleClear = () => {
    setPrompt("");
    setIdeas([]);
    setSource("");
  };

  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="flex-1 px-6 py-6">
        <div className="max-w-5xl mx-auto">
          
          <div className="rounded-2xl p-6 bg-gradient-to-br from-accent/30 via-accent2/20 to-transparent border border-gray-800 mb-6">
            <h1 className="text-2xl font-bold">AI Idea Generator</h1>
            <p className="text-gray-300 mb-4">Transform your thoughts into innovative solutions</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your challenge, project, or topic..."
              className="w-full min-h-[120px] rounded-xl bg-panel/70 border border-gray-800 focus:border-accent outline-none p-4"
            />
            <div className="mt-4 flex gap-3 flex-wrap">
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? "Generating..." : "Generate Ideas"}
              </Button>
              <button
                className="px-4 py-2 rounded-lg border border-gray-700 bg-card"
                onClick={handleClear}
              >
                Clear
              </button>
            </div>
          </div>

  
          {ideas.length > 0 && (
            <>
              <div className="text-sm text-gray-400 mb-3">
                Source: {source === "openai" ? "OpenAI 🤖" : "Fallback ✨"}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {ideas.map((idea, i) => (
                  <div key={i} className="rounded-xl bg-panel/70 border border-gray-800 p-4">
                    <div className="font-semibold">{idea.title}</div>
                    <p className="text-sm text-gray-300">{idea.description}</p>
                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => addToBoard(idea)}>Add to Board</Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
