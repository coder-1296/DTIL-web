document.addEventListener("DOMContentLoaded", () => {
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
        chatInput.value = "";
        appendMessage("bot", "<span class='loading'>Typing...</span>");
        getBotResponse(userMessage);
      }
    }
  
    function appendMessage(sender, message) {
      const messageElement = document.createElement("div");
      messageElement.classList.add("message", sender);
      messageElement.innerHTML = sender === "bot" ? formatBotMessage(message) : message;
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  
    function formatBotMessage(message) {
      let paragraphs = message.split("\n").filter(p => p.trim() !== "");
      let formatted = "";
  
      paragraphs.forEach(paragraph => {
        if (paragraph.match(/^\*\*([A-Za-z\s]+):\*\*/)) {
          const heading = paragraph.match(/^\*\*([A-Za-z\s]+):\*\*/)[1];
          formatted += `<h3>${heading}:</h3>`;
          paragraph = paragraph.replace(/^\*\*([A-Za-z\s]+):\*\*/, "").trim();
        }
  
        paragraph = paragraph.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        paragraph = paragraph.replace(/\*(.*?)\*/g, '<span class="highlight">$1</span>');
  
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
      const API_KEY ="AIzaSyAxBEp1O6TKzz6b9d1Txxq_U7_GB8mL9m0"; // Replace this with a secure call in production
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
  
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userMessage }] }],
          }),
        });
  
        const data = await response.json();
  
        chatMessages.lastChild.remove(); // Remove "Typing..." message
  
        if (!data.candidates || !data.candidates.length) {
          throw new Error("No response from Gemini API");
        }
  
        const botMessage = data.candidates[0].content.parts[0].text;
        appendMessage("bot", botMessage);
      } catch (error) {
        console.error("Error:", error);
        chatMessages.lastChild.remove();
        appendMessage("bot", "Sorry, I'm having trouble responding. Please try again later.");
      }
    }
  });