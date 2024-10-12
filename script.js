import { generate, handleImageUpload } from './index.js';

document.getElementById('sendButton').addEventListener('click', handleSend);

document.getElementById('userInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default behavior of the Enter key
        handleSend();
    }
});

async function handleSend() {
    const userInput = document.getElementById('userInput');
    const responseDiv = document.getElementById('responseDiv');
    const sendButton = document.getElementById('sendButton');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const imageInput = document.getElementById('imageInput');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');

    const inputValue = userInput.value.trim();
    const imageFile = imageInput.files[0];

    if (inputValue.length > 0 && inputValue.length <= 200) {
        appendMessage('user', inputValue, responseDiv);
        saveMessageToSessionStorage('user', inputValue);

        loadingSpinner.style.display = 'inline-block';
        sendButton.style.display = 'none'; // Hide send button while loading
        sendButton.disabled = true;

        try {
            let botResponse;
            if (imageFile) {
                appendImage('user', imageFile, responseDiv); // Append image to chat
                botResponse = await handleImageUpload(imageFile, inputValue);
            } else {
                botResponse = await generate(inputValue);
            }
            appendMessage('bot', botResponse, responseDiv);
            saveMessageToSessionStorage('bot', botResponse);
        } catch (error) {
            console.error("Error generating response:", error);
            appendMessage('bot', "Sorry, I couldn't generate a response. Please try again.", responseDiv);
        } finally {
            loadingSpinner.style.display = 'none';
            sendButton.style.display = 'block'; // Show send button again
            sendButton.disabled = false;
        }

        userInput.value = '';
        imageInput.value = '';
        imagePreviewContainer.style.display = 'none'; // Hide image preview
        responseDiv.scrollTop = responseDiv.scrollHeight;
    } else {
        alert("Please enter a message (1-200 characters).");
    }
}

// Show the image preview when an image is selected
document.getElementById('imageIcon').addEventListener('click', () => {
    imageInput.click(); // Trigger the file input when the icon is clicked
});

imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const previewContainer = document.getElementById('imagePreviewContainer');

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewContainer.innerHTML = `<img src="${e.target.result}" alt="Image Preview">`;
            previewContainer.style.display = 'flex'; // Show flex for centering
        };
        reader.readAsDataURL(file);
    } else {
        previewContainer.style.display = 'none'; // Hide the preview if no file
    }
});

function appendMessage(sender, message, responseDiv) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = message;
    responseDiv.appendChild(messageDiv);
    responseDiv.scrollTop = responseDiv.scrollHeight;
}

function appendImage(sender, imageFile, responseDiv) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const img = document.createElement('img');
    img.src = URL.createObjectURL(imageFile);
    img.alt = "User Image";
    img.style.maxWidth = "100%"; // Ensure the image fits well
    img.style.borderRadius = "15px"; // Optional: add some styling to the image

    messageDiv.appendChild(img);
    responseDiv.appendChild(messageDiv);
    responseDiv.scrollTop = responseDiv.scrollHeight; // Scroll to the latest message
}

function saveMessageToSessionStorage(sender, message) {
    const chatHistory = JSON.parse(sessionStorage.getItem('chatHistory')) || [];
    chatHistory.push({ sender, message });
    sessionStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function loadChatHistoryIfNeeded() {
    const chatHistory = JSON.parse(sessionStorage.getItem('chatHistory'));
    if (chatHistory && chatHistory.length > 0) {
        const loadHistory = confirm("Would you like to load your previous chat history?");
        if (loadHistory) {
            loadChatHistory();
        } else {
            sessionStorage.removeItem('chatHistory');
        }
    }
}

function loadChatHistory() {
    const chatHistory = JSON.parse(sessionStorage.getItem('chatHistory')) || [];
    const responseDiv = document.getElementById('responseDiv');
    chatHistory.forEach(({ sender, message }) => {
        appendMessage(sender, message, responseDiv);
    });
}

// Load chat history when the page loads
window.onload = loadChatHistoryIfNeeded;
