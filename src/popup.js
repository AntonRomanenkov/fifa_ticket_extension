var category = [];
function sendMessage() { 
  if (category && category.length > 0) {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {"message": "start", data: category});
    });
  }
}

document.addEventListener("DOMContentLoaded", function() {
  
  document.getElementById("start").addEventListener("click", function() {
    $("select").each(function(i, e) {
      category[i] = $(this).val();
    });
  
    sendMessage();
  });
  
  document.getElementById("stop").addEventListener("click", function() {  
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {"message": "stop"});
    });
  });
});

chrome.runtime.onMessage.addListener(function(msg) {

});