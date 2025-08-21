 async function showHistory() {
  // const wasSmall = window.innerWidth < screen.width * 0.5;
  // if(wasSmall){
  //   fullScreen(true);
  // }
  l('log btn is clicked');

  // const closeBtn = historyContainer.querySelector('.close-btn');
  const minSuccess = historyContainer.querySelector('.minSuccess');
  const maxSuccess = historyContainer.querySelector('.maxSuccess');
  const minGivenTime = historyContainer.querySelector('.minGivenTime');
  const maxGivenTime = historyContainer.querySelector('.maxGivenTime');
  const minExtraTime = historyContainer.querySelector('.minExtraTime');
  const maxExtraTime = historyContainer.querySelector('.maxExtraTime');
  const startDate = historyContainer.querySelector('.startDate');
  const endDate = historyContainer.querySelector('.endDate');

  const filterBtn = historyContainer.querySelector('.filter')
  const resetBtn = historyContainer.querySelector('.reset');

  const logs = await readLogs();
  l(JSON.stringify(logs));
  renderLogs(logs);

  l(JSON.stringify(logs));



  function applyFilter(){
    const filtered = logs.filter(log => {
      const logDate = new Date(log.timestamp);

      return (
        (!minSuccess.value || minSuccess.value <= log.success) &&
        (!maxSuccess.value || maxSuccess.value >= log.success) && 
        (!minGivenTime.value || minGivenTime.value <= log.givenTime) &&
        (!maxGivenTime.value || maxGivenTime.value >= log.givenTime) &&
        (!minExtraTime.value || minExtraTime.value <= log.extraAlocatedTime) &&
        (!maxExtraTime.value || maxExtraTime.value >= log.extraAlocatedTime) &&
        (!startDate.valueAsDate || startDate.valueAsDate <= logDate) &&
        (!endDate.valueAsDate || endDate.valueAsDate >= logDate)
      );
    });
    renderLogs(filtered);
  }

  function resetFilter(){
    historyContainer.querySelectorAll('.filter-container input').forEach(input => input.value = '');
    renderLogs(logs);
  }
  // function vanishViewLogs(){
  //   document.body.removeChild(historyContainer);
  //   if(wasSmall){
  //     fullScreen(false);
  //   }
  // }
filterBtn.addEventListener('click', applyFilter);
resetBtn.addEventListener('click', resetFilter);
// closeBtn.addEventListener('click',  vanishViewLogs);

}

function formateTimeStamp(iso){
  const date = new Date(iso);
  return date.toLocaleString('en-US',{
    dateStyle : 'medium',
    timeStyle : 'short'
  });
}

function renderLogs(filteredLogs) {
    // filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    filteredLogs.sort((a,b)=> Date.parse(b.timestamp) - Date.parse(a.timestamp));
    const tbody = historyContainer.querySelector('.logTableBody');
    tbody.innerHTML = '';
    filteredLogs.forEach((log, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${log.title}</td>
        <td>${log.givenTime}</td>
        <td>${log.extraAlocatedTime}</td>
        <td>${log.success}</td>
        <td>${log.description}</td>
        <td  class="timestamp">${formateTimeStamp(log.timestamp)}</td>
      `;
      tbody.appendChild(row);
      // l('I am here');
      // l(`innerHTML of row is ${row.innerHTML}`);
    });
}

showHistory();
historyTab.addEventListener('click', () => {
  showHistory();
})


