/* global chrome */

import React, { useState } from "react";

const Popup = () => {
  const [answers, setAnswers] = useState(null);

  // Function to highlight all links in the current page
  const highlightLinks = () => {
    console.log("Sending message to background script to highlight links...");
    chrome.runtime.sendMessage({ action: "highlightLinks" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
        alert("Failed to communicate with the extension. Is the content script loaded?");
        return;
      }
      console.log("Response from background:", response);
      alert(response?.status || "Links highlighted successfully");
    });
  };

  // Function to automatically click a random button on the current page
  const chooseRandomButton = () => {
    console.log("Sending message to background script to choose a random button...");
    chrome.runtime.sendMessage({ action: "chooseRandomButton" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
        alert("Failed to communicate with the extension. Is the content script loaded?");
        return;
      }
      console.log("Response from background:", response);
      alert(response?.status === "No buttons found!" ? "No buttons found on this page." : `Random button clicked: ${response.clickedButtons?.join(", ")}`);
    });
  };

  // Function to send questions to background for answering via GPT
  const answerQuestions = () => {
    console.log("Sending message to background script to answer questions...");
    chrome.runtime.sendMessage({ action: "answerQuestions" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
        alert("Failed to communicate with the extension. Is the content script loaded?");
        return;
      }
      console.log("Response from background:", response);
      if (response.answers) {
        setAnswers(response.answers);
        alert("Answers received from GPT. Check the content.");
      } else {
        alert(response?.status || "Failed to get answers from GPT.");
      }
    });
  };

  // Function to monitor notifications from sites
  const monitorNotifications = () => {
    console.log("Monitoring the notification activity...");
    chrome.runtime.sendMessage({ action: "monitorNotifications" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
        alert("Failed to communicate with the extension. Is the content script loaded?");
        return;
      }
      console.log("Response from background:", response);
      alert(response?.status || "Notification monitoring activated.");
    });
  };

  return (
    <div style={popupStyles.container}>
      <h3 style={popupStyles.header}>React Extension</h3>

      <button
        onClick={highlightLinks}
        style={popupStyles.button}
      >
        Highlight Links
      </button>

      <button
        onClick={chooseRandomButton}
        style={popupStyles.button}
      >
        Auto Choose Button
      </button>

      <button
        onClick={answerQuestions}
        style={popupStyles.button}
      >
        Let AI Answer
      </button>

      <button
        onClick={monitorNotifications}
        style={popupStyles.button}
      >
        Allow Notifications
      </button>

      {answers && (
        <div style={popupStyles.answersContainer}>
          <h4 style={popupStyles.answersHeader}>GPT Answers:</h4>
          <ul style={popupStyles.answersList}>
            {answers.map((answer, index) => (
              <li key={index} style={popupStyles.answerItem}>{answer}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const popupStyles = {
  container: {
    padding: "20px",
    width: "250px",
    backgroundColor: "#f9fafc",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "15px",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007BFF",
    color: "#fff",
    padding: "12px",
    margin: "8px 0",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    width: "100%",
    transition: "background-color 0.3s ease",
  },
  answersContainer: {
    marginTop: "15px",
    backgroundColor: "#fff",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  answersHeader: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "10px",
  },
  answersList: {
    listStyleType: "none",
    padding: "0",
    margin: "0",
  },
  answerItem: {
    fontSize: "14px",
    color: "#333",
    marginBottom: "5px",
  },
};

export default Popup;
