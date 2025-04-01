document.addEventListener("DOMContentLoaded", function () {
  const sendBtn = document.getElementById("send-btn");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");

  sendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
  });

  function sendMessage() {
      const userMessage = chatInput.value.trim();
      if (userMessage) {
          appendMessage("user", userMessage);
          chatInput.value = ""; // Clear input
          getBotResponse(userMessage);
      }
  }

  function appendMessage(sender, message) {
      const messageElement = document.createElement("div");
      messageElement.classList.add("message", sender);

      if (sender === "bot") {
          // Format the bot's response with HTML for better styling
          const formattedMessage = formatBotMessage(message);
          messageElement.innerHTML = formattedMessage;
      } else {
          messageElement.textContent = message;
      }

      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function formatBotMessage(message) {
      // Split the message into paragraphs
      let paragraphs = message.split("\n").filter(p => p.trim() !== "");

      // Initialize the formatted HTML
      let formatted = "";

      paragraphs.forEach(paragraph => {
          // Check for headings (e.g., "Definition", "Core Function")
          if (paragraph.match(/^\*\*([A-Za-z\s]+):\*\*/)) {
              const heading = paragraph.match(/^\*\*([A-Za-z\s]+):\*\*/)[1];
              formatted += `<h3>${heading}:</h3>`;
              paragraph = paragraph.replace(/^\*\*([A-Za-z\s]+):\*\*/, "").trim();
          }

          // Bold terms between **...**
          paragraph = paragraph.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

          // Highlight terms between *...*
          paragraph = paragraph.replace(/\*(.*?)\*/g, '<span class="highlight">$1</span>');

          // Check for numbered lists (e.g., "1.", "2.")
          if (paragraph.match(/^\d+\./)) {
              let listItems = paragraph.split(/(?=\d+\.)/).filter(item => item.trim() !== "");
              formatted += "<ul>";
              listItems.forEach(item => {
                  item = item.replace(/\d+\./, "").trim();
                  formatted += `<li>${item}</li>`;
              });
              formatted += "</ul>";
          } else {
              formatted += `<p>${paragraph}</p>`;
          }
      });

      return formatted;
  }

  async function getBotResponse(userMessage) {
      const API_KEY = "AIzaSyAxBEp1O6TKzz6b9d1Txxq_U7_GB8mL9m0";
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

      try {
          const response = await fetch(API_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  contents: [
                      {
                          parts: [{ text: userMessage }],
                      },
                  ],
              }),
          });

          const data = await response.json();

          if (!data.candidates || !data.candidates.length) {
              throw new Error("No response from Gemini API");
          }

          const botMessage = data.candidates[0].content.parts[0].text;
          appendMessage("bot", botMessage);
      } catch (error) {
          console.error("Error:", error);
          appendMessage(
              "bot",
              "Sorry, I'm having trouble responding. Please try again."
          );
      }
  }
});