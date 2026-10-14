// background.js — Service Worker for HackerRank Leaderboard Scraper

chrome.runtime.onInstalled.addListener(() => {
  console.log('[HackerRank Scraper] Extension installed.');
});

// Optional: Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ status: 'OK' });
  }
  return true; // Keep channel open for async
});
