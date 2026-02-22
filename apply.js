const urlParams = new URLSearchParams(window.location.search);
const linkId = urlParams.get('job');
let currentQ = 0;
let scores = 0;

async function loadJob() {
    try {
        const res = await fetch(`/api/jobs/${linkId}`);
        const job = await res.json();

        document.getElementById('title').textContent = `Apply: ${job.role}`;
        document.getElementById('jd').innerHTML = `<p>${job.jd}</p>`;
        showQuestion(job.mcqs || []);
    } catch (error) {
        document.getElementById('quiz').innerHTML = '<h2>❌ Invalid job link</h2>';
    }
}

function showQuestion(mcqs) {
    if (currentQ >= 5 || currentQ >= mcqs.length) {
        document.getElementById('quiz').style.display = 'none';
        document.getElementById('resumeForm').style.display = 'block';
        return;
    }

    const mcq = mcqs[currentQ];
    document.getElementById('quiz').innerHTML = `
    <h3>Q${currentQ + 1}/5: ${mcq.q}</h3>
    ${mcq.options.map((option, idx) => `
      <button type="button" onclick="answer(${idx}, ${mcq.correct}, '${linkId}')">
        ${option}
      </button>
    `).join('')}
  `;
}

async function answer(selected, correct, linkId) {
    scores++;

    if (selected !== correct) {
        await fetch(`/api/apply/${linkId}/knockout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score: scores - 1, isCorrect: false })
        });
        document.getElementById('quiz').innerHTML = `
      <h2>❌ Knocked Out!</h2>
      <p>Wrong answer. Better luck next time!</p>
    `;
        return;
    }

    await fetch(`/api/apply/${linkId}/knockout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: scores, isCorrect: true })
    });

    currentQ++;
    setTimeout(() => loadJob(), 1000);
}

document.getElementById('resumeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('mcqScores', scores);
    formData.append('resume', document.getElementById('resume').files[0]);

    try {
        await fetch(`/api/apply/${linkId}/submit`, {
            method: 'POST',
            body: formData
        });
        document.getElementById('resumeForm').innerHTML = `
      <h2>✅ Application Submitted!</h2>
      <p>Recruiter will contact you soon. Thank you!</p>
    `;
    } catch (error) {
        alert('Submit error: ' + error.message);
    }
});

loadJob();
