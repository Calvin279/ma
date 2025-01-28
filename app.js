class WorkHoursTracker {
  constructor() {
    this.workHoursBody = document.getElementById('workHoursBody');
    this.weeklySummaryBody = document.getElementById('weeklySummaryBody');
    this.workHoursForm = document.getElementById('workHoursForm');
    this.searchInput = document.getElementById('searchInput');
    this.searchButton = document.getElementById('searchButton');
    this.resetTableBtn = document.getElementById('resetTableBtn');

    this.workRecords = JSON.parse(localStorage.getItem('workRecords')) || [];
    this.weeklyRecords = JSON.parse(localStorage.getItem('weeklyRecords')) || {};

    this.initEventListeners();
    this.renderTables();
  }

  initEventListeners() {
    this.workHoursForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    this.searchButton.addEventListener('click', () => this.searchEmployees());
    this.resetTableBtn.addEventListener('click', () => this.resetTables());
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const role = document.getElementById('role').value;
    const date = document.getElementById('date').value;
    const entryTime = document.getElementById('entryTime').value;
    const exitTime = document.getElementById('exitTime').value;

    const { hours, minutes, seconds } = this.calculateWorkDuration(entryTime, exitTime);
    const compliance = this.checkComplianceStatus(hours);

    const record = {
      name, 
      role, 
      date, 
      entryTime, 
      exitTime, 
      hours, 
      minutes, 
      seconds,
      compliance
    };

    this.workRecords.push(record);
    this.updateWeeklyRecords(record);
    this.saveToLocalStorage();
    this.renderTables();
    this.workHoursForm.reset();
  }

  calculateWorkDuration(entryTime, exitTime) {
    const [entryHours, entryMinutes] = entryTime.split(':').map(Number);
    const [exitHours, exitMinutes] = exitTime.split(':').map(Number);

    let hours = exitHours - entryHours;
    let minutes = exitMinutes - entryMinutes;

    if (minutes < 0) {
      hours--;
      minutes += 60;
    }

    const seconds = 0; // Keeping seconds as 0 for simplicity
    return { hours, minutes, seconds };
  }

  checkComplianceStatus(hours) {
    return hours >= 3 ? '✔️' : '❌';
  }

  updateWeeklyRecords(record) {
    const week = this.getWeekNumber(new Date(record.date));
    if (!this.weeklyRecords[record.name]) {
      this.weeklyRecords[record.name] = { totalHours: 0, records: [] };
    }
    
    this.weeklyRecords[record.name].totalHours += record.hours;
    this.weeklyRecords[record.name].records.push(record);
  }

  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  renderTables() {
    this.renderWorkHoursTable();
    this.renderWeeklySummaryTable();
  }

  renderWorkHoursTable() {
    this.workHoursBody.innerHTML = '';
    this.workRecords.forEach(record => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${record.name}</td>
        <td>${record.role}</td>
        <td>${record.date}</td>
        <td>${record.entryTime}</td>
        <td>${record.exitTime}</td>
        <td>${record.hours}h ${record.minutes}m</td>
        <td class="${record.compliance === '✔️' ? 'compliance-good' : 'compliance-bad'}">
          ${record.compliance}
        </td>
      `;
      this.workHoursBody.appendChild(row);
    });
  }

  renderWeeklySummaryTable() {
    this.weeklySummaryBody.innerHTML = '';
    Object.entries(this.weeklyRecords).forEach(([name, data]) => {
      const row = document.createElement('tr');
      const weeklyCompliance = data.totalHours >= 28 ? '😊' : '😞';
      row.innerHTML = `
        <td>${name}</td>
        <td>${data.totalHours}h</td>
        <td class="${weeklyCompliance === '😊' ? 'compliance-good' : 'compliance-bad'}">
          ${weeklyCompliance}
        </td>
      `;
      this.weeklySummaryBody.appendChild(row);
    });
  }

  searchEmployees() {
    const searchTerm = this.searchInput.value.toLowerCase();
    const filteredRecords = this.workRecords.filter(record => 
      record.name.toLowerCase().includes(searchTerm)
    );

    this.workHoursBody.innerHTML = '';
    filteredRecords.forEach(record => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${record.name}</td>
        <td>${record.role}</td>
        <td>${record.date}</td>
        <td>${record.entryTime}</td>
        <td>${record.exitTime}</td>
        <td>${record.hours}h ${record.minutes}m</td>
        <td class="${record.compliance === '✔️' ? 'compliance-good' : 'compliance-bad'}">
          ${record.compliance}
        </td>
      `;
      this.workHoursBody.appendChild(row);
    });
  }

  resetTables() {
    this.workRecords = [];
    this.weeklyRecords = {};
    this.saveToLocalStorage();
    this.renderTables();
  }

  saveToLocalStorage() {
    localStorage.setItem('workRecords', JSON.stringify(this.workRecords));
    localStorage.setItem('weeklyRecords', JSON.stringify(this.weeklyRecords));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new WorkHoursTracker();
});