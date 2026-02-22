// Auto-refresh every 5 seconds
setInterval(() => {
    loadStats();
    loadApps();
}, 5000);

// Load dashboard metrics
async function loadStats() {
    try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        document.getElementById('total').querySelector('.metric-value').textContent = data.total;
        document.getElementById('knocked').querySelector('.metric-value').textContent = data.knocked;
        document.getElementById('shortlisted').querySelector('.metric-value').textContent = data.shortlisted;
    } catch (e) {
        console.error('Stats load error:', e);
    }
}

// Load applications table
async function loadApps() {
    try {
        const res = await fetch('/api/applications');
        const apps = await res.json();
        const tbody = document.querySelector('#appsTable tbody');
        tbody.innerHTML = apps.map(app => `
      <tr>
        <td>${app.candidateName || 'N/A'}</td>
        <td>${app.email || 'N/A'}</td>
        <td><span class="status ${app.status}">${app.status.replace('_', ' ').toUpperCase()}</span></td>
        <td>
          ${app.resumePath ?
                `<a href="${app.resumePath}" target="_blank" class="download-btn">📄 Download</a>` :
                'No resume'
            }
        </td>
      </tr>
    `).join('');
    } catch (e) {
        console.error('Apps load error:', e);
    }
}

// Create MCQ inputs on page load
document.addEventListener('DOMContentLoaded', function () {
    const mcqsContainer = document.getElementById('mcqs');
    for (let i = 0; i < 5; i++) {
        mcqsContainer.innerHTML += `
      <div class="mcq-group">
        <h4>Q${i + 1}:</h4>
        <input type="text" id="q${i}" placeholder="Enter question ${i + 1}" required>
        <input type="text" id="opts${i}" placeholder="Options A,B,C,D (comma separated)" required>
        <input type="number" id="ci${i}" min="0" max="3" placeholder="Correct index (0=A,1=B,2=C,3=D)" required>
      </div>
    `;
    }

    loadStats();
    loadApps();
});

// Handle job creation
document.getElementById('jobForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const mcqs = [];
    for (let i = 0; i < 5; i++) {
        const question = document.getElementById(`q${i}`).value;
        const optionsInput = document.getElementById(`opts${i}`).value;

        if (!question || !optionsInput) {
            alert(`Please complete Q${i + 1}`);
            return;
        }

        const options = optionsInput.split(',').map(opt => opt.trim()).slice(0, 4);
        const correctIdx = parseInt(document.getElementById(`ci${i}`).value) || 0;

        mcqs.push({ q: question, options, correct: correctIdx });
    }

    try {
        const response = await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: document.getElementById('role').value,
                jd: document.getElementById('jd').value,
                mcqs
            })
        });

        const result = await response.json();
        document.getElementById('link').innerHTML = `
      <div class="success-link">
        <h3>✅ Hiring Link Generated!</h3>
        <p>Share this link with candidates:</p>
        <a href="${result.link}" target="_blank" class="share-link">${result.link}</a>
        <button type="button" onclick="copyLink('${result.link}')">📋 Copy Link</button>
      </div>
    `;
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

function copyLink(link) {
    navigator.clipboard.writeText(link).then(() => {
        alert('Link copied!');
    });
}
