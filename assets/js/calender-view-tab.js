const now = new Date();
let year = now.getFullYear();
let month = now.getMonth() + 1;
let dailyTasks = {};
const checkins = {};

(async()=> {
    const res = await ipcRenderer.invoke('load-daily-tasks');
    dailyTasks = res.data;
    for(let key in dailyTasks){
      let done = 0;
      dailyTasks[key].forEach((task)=>{
        if(task.done) done++;
      });
      checkins[key] = Math.round((done / dailyTasks[key].length) * 100) || 0;
    }
  generateCalendar(year, month);

})();
  

   function getDayColor(percent) {
      if(percent === 0) return "dot-red";
      if(!percent)  return "dot-gray";
      if (percent < 40) return "dot-red";
      if (percent < 60) return "dot-orange";
      if (percent < 80) return "dot-purple";
      else return "dot-green";
    }
       function generateCalendar(year, month) {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = ''; // clear previous

  const startDate = new Date(year, month - 1, 1); // month is 0-based
  const startDay = startDate.getDay();

  const daysInMonth = new Date(year, month, 0).getDate();

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement('div');
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const dayDiv = document.createElement('div');
    const colorClass = getDayColor(checkins[dateStr]);
    dayDiv.className = `day ${colorClass}`;
    dayDiv.textContent = day;
    calendar.appendChild(dayDiv);
  }


document.querySelector('.month-label').innerText = getMonthLabel(year, month);
l(`getMonthLabel is ${getMonthLabel(year, month)}`);

function getMonthLabel(year, month) {
  const date = new Date(year, month - 1); // month is 0-indexed
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}
document.querySelector('.month-label').innerText = getMonthLabel(year, month);
l(`getMonthLabel is ${getMonthLabel(year, month)}`);
}


document.getElementById('nextMonth').addEventListener('click', ()=> {
    if(month >= 12){
        month = 1; year++;
    } else {
        month++;
    }
    generateCalendar(year, month);
});
document.getElementById('prevMonth').addEventListener('click', ()=> {
    if(month <= 1){
        month = 12 ; year--;
    } else {
        month--;
    }
    generateCalendar(year, month);
});
