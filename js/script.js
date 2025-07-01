// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWHDSkFJRflliW3LXuKAbNXKiwGw8W2C8",
  authDomain: "eco-flow-bin.firebaseapp.com",
  databaseURL: "https://eco-flow-bin-default-rtdb.firebaseio.com",
  projectId: "eco-flow-bin",
  storageBucket: "eco-flow-bin.firebasestorage.app",
  messagingSenderId: "704131179397",
  appId: "1:704131179397:web:5eb3737d854b0125cddaec",
  measurementId: "G-R2B073XGD8"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Dustbin data — only bin-001 is live, rest are static
const dustbinData = {
  'bin-002': { name: 'Library Cafe', location: 'Near Central Library, VVCE', fillLevel: 66, status: 'Medium' },
  'bin-003': { name: 'Hostel Block A', location: 'Behind Boys Hostel A, VVCE', fillLevel: 85, status: 'High' },
  'bin-004': { name: 'Workshop Area', location: 'Mechanical Dept. Workshop, VVCE', fillLevel: 98, status: 'Full' },
  'bin-005': { name: 'Canteen Exit', location: 'Near Canteen Block, VVCE', fillLevel: 15, status: 'Low' },
  'bin-006': { name: 'Sports Complex', location: 'Adjacent to Cricket Ground, VVCE', fillLevel: 48, status: 'Medium' },
  'bin-007': { name: 'ECE Department', location: 'Complex, ECE BLOCK, VVCE', fillLevel: 20, status: 'Low' },
  'bin-008': { name: 'Admin Block Parking', location: 'Visitor Parking, Admin Building, VVCE', fillLevel: 79, status: 'High' },
  'bin-009': { name: 'Food Court VVCE', location: 'Main Food Court, VVCE Campus', fillLevel: 100, status: 'Full' }
};

// Connect bin-001 to Firebase live data
const ref = database.ref('ecoflow/bin-001');
ref.on('value', (snapshot) => {
  const data = snapshot.val();
  if (data) {
    dustbinData['bin-001'] = {
      name: data.name || 'VVCE Campus',
      location: data.location || 'Main Entrance, VVCE Mysuru',
      fillLevel: data.fillLevel || 0,
      status: data.status || 'Low'
    };
    updateHomePageCards(); // update UI if needed
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.details-container')) {
    initDetailsPage();
  } else if (document.querySelector('.dustbin-grid')) {
    initHomePage();
  }

  function initHomePage() {
    updateHomePageCards();
  }

  function updateHomePageCards() {
    const cards = document.querySelectorAll('.dustbin-card');
    cards.forEach(card => {
      const binId = card.getAttribute('data-id');
      const data = dustbinData[binId];
      if (data) {
        const statusSpan = card.querySelector('.status-low, .status-medium, .status-high, .status-full');
        const fillLevelSpan = card.querySelector('.fill-level');

        statusSpan.textContent = data.status;
        statusSpan.className = `status-${data.status.toLowerCase()}`;
        fillLevelSpan.textContent = `${data.fillLevel}%`;
      }
    });
  }

  function initDetailsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const binId = urlParams.get('id');

    if (binId && dustbinData[binId]) {
      updateDustbinDetails(binId);
      setInterval(() => {
        simulateRealTimeData(binId);
        updateDustbinDetails(binId);
      }, 2000);
    } else {
      const detailsHeader = document.querySelector('.details-header h1');
      if (detailsHeader) detailsHeader.textContent = "Dustbin Not Found";
    }
  }

  function simulateRealTimeData(binId) {
    if (binId === 'bin-001') return; // Do not simulate live bin

    let currentFill = dustbinData[binId].fillLevel;
    let newFill = currentFill + Math.floor(Math.random() * 5) - 2;
    newFill = Math.max(0, Math.min(100, newFill));
    dustbinData[binId].fillLevel = newFill;
    dustbinData[binId].status = getStatusFromFillLevel(newFill);
  }

  function updateDustbinDetails(binId) {
    const data = dustbinData[binId];
    if (!data) return;

    const { name, fillLevel, status } = data;
    const statusClass = `status-${status.toLowerCase()}`;
    const statusColor = getComputedStyle(document.documentElement).getPropertyValue(`--${statusClass}`);

    document.getElementById('dustbin-id').textContent = `Dustbin ${name}`;
    document.getElementById('dustbin-status').textContent = status;
    document.getElementById('dustbin-status').className = statusClass;

    const fillValueElement = document.getElementById('fill-level-value');
    fillValueElement.textContent = fillLevel;
    fillValueElement.parentElement.style.color = statusColor;

    fillValueElement.parentElement.classList.add('updated');
    setTimeout(() => {
      fillValueElement.parentElement.classList.remove('updated');
    }, 500);

    document.getElementById('progress-bar-inner').style.width = `${fillLevel}%`;
    document.getElementById('progress-bar-inner').style.backgroundColor = statusColor;
  }

  function getStatusFromFillLevel(level) {
    if (level >= 95) return 'Full';
    if (level >= 75) return 'High';
    if (level >= 40) return 'Medium';
    return 'Low';
  }
});
