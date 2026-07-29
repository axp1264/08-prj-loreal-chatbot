const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

const WORKER_URL = "https://snowy-mud-7eb2.khoi07112006.workers.dev";

const SYSTEM_PROMPT = `You are an AI Beauty Advisor for L'Oréal. 
Your objective is to help users discover and understand L'Oréal products across makeup, skincare, haircare, and fragrances, as well as offer personalized routines and product recommendations.
Strict Rules:
1. Only answer questions related to L'Oréal products, beauty routines, skincare, haircare, makeup, and fragrances.
2. If a user asks a question about unrelated topics (e.g., coding, sports, general math, politics), politely decline by stating that you are only trained to assist with L'Oréal products and beauty advice.`;

let conversationHistory = [{ role: "system", content: SYSTEM_PROMPT }];

appendMessage(
  "ai",
  "👋 Hello! I am your L'Oréal Beauty Advisor. How can I help you find the right products or routine today?",
);

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  userInput.value = "";
  appendMessage("user", text);

  conversationHistory.push({ role: "user", content: text });

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

    const data = await response.json();

    console.log("Worker Response Data:", data);

    if (data.error) {
      const errorMsg =
        typeof data.error === "object" ? data.error.message : data.error;
      throw new Error(`Worker Error: ${errorMsg}`);
    }

    if (!data.choices || !data.choices[0]) {
      throw new Error("Invalid response format received from API.");
    }

    const botReply = data.choices[0].message.content;

    loadingBubble.remove();
    appendMessage("ai", botReply);

    conversationHistory.push({ role: "assistant", content: botReply });
  } catch (error) {
    console.error("Error communicating with Cloudflare Worker:", error);
    loadingBubble.remove();
    appendMessage(
      "ai",
      "Sorry, I am currently unable to process your request. Please check the console for details.",
    );
  } finally {
    setFormLoading(false);
  }
});
function appendMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg", sender);
  msgDiv.innerHTML = DOMPurify.sanitize(marked.parse(text));

  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return msgDiv;
}
function setFormLoading(isLoading) {
  userInput.disabled = isLoading;
  sendBtn.disabled = isLoading;
  if (!isLoading) {
    userInput.focus();
  }
}
