// DOM elements
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

// Replace with your deployed Cloudflare Worker URL
const WORKER_URL = "https://snowy-mud-7eb2.khoi07112006.workers.dev";

// Guardrail System Prompt
const SYSTEM_PROMPT = `You are an AI Beauty Advisor for L'Oréal. 
Your objective is to help users discover and understand L'Oréal products across makeup, skincare, haircare, and fragrances, as well as offer personalized routines and product recommendations.
Strict Rules:
1. Only answer questions related to L'Oréal products, beauty routines, skincare, haircare, makeup, and fragrances.
2. If a user asks a question about unrelated topics (e.g., coding, sports, general math, politics), politely decline by stating that you are only trained to assist with L'Oréal products and beauty advice.`;

// Conversation History Array (LevelUp: Maintain Conversation History)
let conversationHistory = [{ role: "system", content: SYSTEM_PROMPT }];

// Initial Greeting
appendMessage(
  "ai",
  "👋 Hello! I am your L'Oréal Beauty Advisor. How can I help you find the right products or routine today?",
);

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  // Clear input field and render user message (LevelUp: Chat Conversation UI & Display Question)
  userInput.value = "";
  appendMessage("user", text);

  // Push message to context history
  conversationHistory.push({ role: "user", content: text });

  // Add temporary loading indicator
  const loadingBubble = appendMessage(
    "system-status",
    "L'Oréal Advisor is thinking...",
  );
  setFormLoading(true);

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: conversationHistory }),
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    const botReply = data.choices[0].message.content;

    // Remove loading indicator and render AI response
    loadingBubble.remove();
    appendMessage("ai", botReply);

    // Save AI response to history for multi-turn tracking
    conversationHistory.push({ role: "assistant", content: botReply });
  } catch (error) {
    console.error("Error communicating with Cloudflare Worker:", error);
    loadingBubble.remove();
    appendMessage(
      "ai",
      "Sorry, I am currently unable to process your request. Please check your connection and try again.",
    );
  } finally {
    setFormLoading(false);
  }
});

/**
 * Appends a message bubble to the chat window and scrolls into view.
 */
function appendMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg", sender);
  msgDiv.textContent = text;

  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return msgDiv;
}

/**
 * Disables or enables inputs while waiting for API responses.
 */
function setFormLoading(isLoading) {
  userInput.disabled = isLoading;
  sendBtn.disabled = isLoading;
  if (!isLoading) {
    userInput.focus();
  }
}
