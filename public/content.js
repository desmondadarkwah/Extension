/* global chrome */

// Function to highlight all links on the page
function highlightLinks() {
  const links = document.querySelectorAll('a');
  if (links.length === 0) {
    console.log("No links found on the page.");
    return { status: "No links to highlight!" };
  }

  links.forEach(link => {
    link.style.backgroundColor = 'yellow';
  });
  console.log(`${links.length} links highlighted.`);
  return { status: "Links highlighted successfully!" };
}

// Function to choose random buttons on the page (e.g., quizzes, radio buttons)
function chooseRandomButton() {
  const buttons = Array.from(document.querySelectorAll('input[type="button"], button, input[type="radio"]'));
  if (buttons.length === 0) {
    console.log("No clickable buttons found on the page.");
    return { status: "No buttons found!" };
  }

  const chosenButtons = [];
  const totalButtons = Math.min(buttons.length, 5); // Click a maximum of 5 buttons to prevent excessive actions

  for (let i = 0; i < totalButtons; i++) {
    const randomIndex = Math.floor(Math.random() * buttons.length);
    const chosenButton = buttons[randomIndex];
    buttons.splice(randomIndex, 1); // Remove selected button from the array
    console.log(`Randomly chosen button ${i + 1}:`, chosenButton);
    chosenButton.click();
    chosenButtons.push(chosenButton.innerText || chosenButton.id || "Unnamed Button");
  }

  return {
    status: "Random buttons clicked!",
    clickedButtons: chosenButtons
  };
}

// Function to extract questions from the page and send them for processing
function answerQuestions() {
  const fieldsets = Array.from(document.querySelectorAll('fieldset'));

  const questions = fieldsets.map((fieldset) => {
    const questionText = Array.from(fieldset.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim().length > 0)
      .map(node => node.nodeValue.trim())
      .join(' ') || "Unnamed Question";

    const options = Array.from(fieldset.querySelectorAll('option.mcAnswerText')).map(option => option.textContent.trim());

    return { question: questionText, options };
  });

  if (questions.length === 0) {
    console.log("No questions found on the page.");
    return { status: "No questions found!" };
  }

  console.log("Extracted questions:", questions);

  // Send questions to the background script
  chrome.runtime.sendMessage({ action: "processQuestions", questions }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error sending message to the background script:", chrome.runtime.lastError.message);
      return;
    }
    console.log("Answer received from AI:", response);
    displayAnswers(response.answers || []);
  });

  return { status: "Questions sent for answering!" };
}

// Function to display answers on the page
function displayAnswers(answers) {
  if (answers.length === 0) {
    console.log("No answers to display.");
    return;
  }

  console.log("Displaying answers:", answers);

  const modal = document.createElement('div');
  Object.assign(modal.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    zIndex: 9999,
    maxWidth: '80%',
    maxHeight: '80%',
    overflow: 'auto'
  });

  modal.innerHTML = `
    <h3>AI Answers</h3>
    <ul>
      ${answers.map(answer => `<li>${answer}</li>`).join('')}
    </ul>
    <button id="close-modal">Close</button>
  `;

  document.body.appendChild(modal);

  document.getElementById('close-modal').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
}

// Function to monitor notifications and display them
function monitorNotifications() {
  const notificationButton = document.querySelector('.portal-notifications-button, .portal-notifications-icon.bi-bell, .portal-notifications-button.btn.icon-button');

  if (!notificationButton) {
    console.log("Notification button not found.");
    return { status: "Notification button not found!" };
  }

  notificationButton.addEventListener('click', () => {
    const nextButton = document.querySelector('.accordion-button,.collapsed');

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        const lecturerNameElement = document.querySelector('strong.me-auto');
        const notificationContentElement = document.querySelector('div');

        const lecturerName = lecturerNameElement ? lecturerNameElement.textContent : "Unknown Lecturer";
        const notificationContent = notificationContentElement ? notificationContentElement.textContent : "No content available.";

        // Notify the user about the new notification
        sendNotificationToPhone(lecturerName);
        
        // Optionally, create a modal to show the notification content on the website
        createModal("Notification", `<strong>Lecturer:</strong> ${lecturerName}<br><strong>Message:</strong> ${notificationContent}`);
        
        console.log('Lecturer name is:', lecturerName);
        console.log('Notification content:', notificationContent);
      });
    } else {
      console.log("Next button not found.");
    }
  });

  return { status: "Notification monitoring activated!" };
}

// Function to send a notification to the user's phone
function sendNotificationToPhone(lecturerName) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png', // Your icon here
    title: 'New Lecturer Notification',
    message: `You have a new notification from: ${lecturerName}`,
    priority: 2
  });
}

// Listener for messages from the popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "highlightLinks") {
    console.log("Content script received a request to highlight links.");
    const result = highlightLinks();
    sendResponse(result);
  } else if (request.action === "chooseRandomButton") {
    console.log("Content script received a request to choose random buttons.");
    const result = chooseRandomButton();
    sendResponse(result);
  } else if (request.action === "answerQuestions") {
    console.log("Content script received a request to answer questions.");
    const result = answerQuestions();
    sendResponse(result);
  } else if (request.action === "monitorNotifications") {
    console.log("Content script received a request to monitor notifications.");
    const result = monitorNotifications();
    sendResponse(result);
  } else {
    console.log("Unknown action received:", request.action);
    sendResponse({ status: "Unknown action!" });
  }
});
