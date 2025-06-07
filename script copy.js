const TaskName = document.getElementById("task-name");
const Qoute = document.getElementById("qoute");
const H = document.getElementById("h");
const M = document.getElementById("m");
const S = document.getElementById("n");
const form = document.getElementById("inputForm");
const Reset = document.getElementById("reset");
const Goals = document.getElementById("terget-list");
const CountUpBtn = document.getElementById("countUp-btn");


form.addEventListener("submit", (e) => {
  e.preventDefault();
  const iH = document.getElementById("h-i").value || 0;
  const iM = document.getElementById("m-i").value || 0;
  const iS = document.getElementById("s-i").value || 0;
  const taskInput = document.getElementById("taskInput").value; 
  TaskName.innerText = taskInput;
  document.getElementById("input").style.display = "none";
  alert(`Time entered: ${iH}h ${iM}m ${iS}s`);

  process(iH, iM, iS);
});



function process(h, m, s) {
  const TakenTime = h * 3600000 + m * 60000 + s * 1000;
  const timeTarget = new Date().getTime() + TakenTime;
  const countDown = setInterval(() => {
    const now = new Date().getTime();
    const remaining = timeTarget - now;
    const vH = document.getElementById('h');
    const vM = document.getElementById('m');
    const vS = document.getElementById('s');

    if (remaining <= 0) {
      playAudio("D:\\web.me\\extention\\kotlin\\Quran Tilawat\\Beautiful voice recitation of quran By Idris al Hashemi  إدريس آل هاشيمي.mp3");
      renew();
      clearInterval(countDown);
      return;
    }

    hours = Math.floor(remaining / (3600000));
    minutes = Math.floor((remaining % 3600000 ) / 60000);
    seconds = Math.floor((remaining % 60000) / 1000);
    if(hours < 10){
      vH.textContent = String(hours).padStart(1,'0');
    } else {
      vH.textContent = String(hours).padStart(2,'0');
    }
    vM.textContent = String(minutes).padStart(2,'0');
    vS.textContent = String(seconds).padStart(2,'0');


  
  },1000);
}

function playAudio(audioFilePath) {
  const audio = new Audio(audioFilePath);
  audio.play().catch(error => {
    alert("Error playing audio: " + error.message);
  });
}

function renew() {
  const renew = document.getElementById("renew");
  renew.style.display = "flex";
  Reset.addEventListener("click",function() {
    location.reload();
});
}

// settings part

const settingsBtn = document.getElementById("settings-btn");
const settingsMenu = document.getElementById("settings-menu");
const countupPlayPouseBtn =  document.getElementById("countup-playPouse-btn");


settingsBtn.addEventListener("click",()=> {
  settingsMenu.style.display = settingsMenu.style.display === "none" ? "flex" : "none";

});
document.addEventListener("click", (event) => {
  if (!settingsMenu.contains(event.target) && !settingsBtn.contains(event.target)) {
    settingsMenu.style.display = "none";
  }
});

countupPlayPouseBtn.addEventListener("click",()=> {
  countupPlayPouseBtn.innerHTML = countupPlayPouseBtn.innerHTML === "▶️" ? "⏸️" : "▶️";
});



//rotating message disply
const qouteBoxes = document.querySelectorAll(".qoute");

qouteBoxes.forEach((qoute) => {
  if(window.getComputedStyle(qoute).display !== "none") {
   
      const messages = [
        "Stay strong, you're on the right path!",
        "Every second counts towards a better you!",
        "Victory is built on moments like this.",
        "Remember why you started."
      ];
    
      let messageIndex = 0;
    
      function changeMessage() {
        qoute.classList.add("fade-out");
    
        setTimeout(() => {
          qoute.textContent = messages[messageIndex];
          messageIndex = (messageIndex + 1) % messages.length;
          qoute.classList.remove("fade-out");
        }, 500);
      }
    
      setInterval(changeMessage, 5000);
    
    } else {
      console.error("Element with ID 'rotating-message' not found.");
    }
});
/*
if (messageElement) {
  const messages = [
    "Stay strong, you're on the right path!",
    "Every second counts towards a better you!",
    "Victory is built on moments like this.",
    "Remember why you started."
  ];

  let messageIndex = 0;

  function changeMessage() {
    messageElement.classList.add("fade-out");

    setTimeout(() => {
      messageElement.textContent = messages[messageIndex];
      messageIndex = (messageIndex + 1) % messages.length;
      messageElement.classList.remove("fade-out");
    }, 500);
  }

  setInterval(changeMessage, 5000);
} else {
  console.error("Element with ID 'rotating-message' not found.");
}*/

