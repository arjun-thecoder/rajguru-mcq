let questions = [];
let index = 0;
let answered = false;
let currentDate = new Date();

// Check if a date has MCQ data available
async function checkDateHasData(date) {
    const year = date.getFullYear();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const day = date.getDate();
    const filePath = `2026 Current Affairs/${month}/${day}.json`;

    try {
        const response = await fetch(filePath, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Load questions from date-specific JSON file
async function loadQuestions(date = null) {
    if (!date) {
        date = currentDate;
    }

    const year = date.getFullYear();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const day = date.getDate();
    const filePath = `2026 Current Affairs/${month}/${day}.json`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error('File not found');
        }
        questions = await response.json();
        loadQuestion();
        updateDateDisplay(date);
    } catch (error) {
        console.error('Error loading questions:', error);
        // Show message that no MCQs available for this date
        document.getElementById("mcq-box").innerHTML = `
            <div class="no-data">
                <h3>📅 ${day} ${month} ${year}</h3>
                <p>इस तारीख के लिए MCQ अभी उपलब्ध नहीं हैं</p>
                <p>कृपया दूसरी तारीख चुनें</p>
            </div>
        `;
        document.getElementById("nextBtn").style.display = "none";
    }
}

function updateDateDisplay(date) {
    const year = date.getFullYear();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const day = date.getDate();
    document.getElementById("date-display").textContent = `${day} ${month} ${year}`;
    // Also update the date picker value
    document.getElementById("date-picker").value = date.toISOString().split('T')[0];
}

async function changeDate(days) {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    
    // Check if the new date has MCQ data
    const hasData = await checkDateHasData(newDate);
    if (hasData) {
        currentDate = newDate;
        index = 0; // Reset question index
        answered = false;
        document.getElementById("exp-container").innerHTML = "";
        loadQuestions(currentDate);
    } else {
        // Show message that the target date doesn't have data
        document.getElementById("mcq-box").innerHTML = `
            <div class="no-data">
                <h3>📅 ${newDate.getDate()} ${newDate.toLocaleString('en-US', { month: 'long' })} ${newDate.getFullYear()}</h3>
                <p>इस तारीख के लिए MCQ अभी उपलब्ध नहीं हैं</p>
                <p>कृपया दूसरी तारीख चुनें</p>
            </div>
        `;
        document.getElementById("nextBtn").style.display = "none";
        document.getElementById("exp-container").innerHTML = "";
    }
}

async function goToToday() {
    const today = new Date();
    
    // Check if today has MCQ data
    const hasData = await checkDateHasData(today);
    if (hasData) {
        currentDate = today;
        index = 0;
        answered = false;
        document.getElementById("exp-container").innerHTML = "";
        loadQuestions(currentDate);
    } else {
        // Show message that today doesn't have data
        document.getElementById("mcq-box").innerHTML = `
            <div class="no-data">
                <h3>📅 ${today.getDate()} ${today.toLocaleString('en-US', { month: 'long' })} ${today.getFullYear()}</h3>
                <p>आज के लिए MCQ अभी उपलब्ध नहीं हैं</p>
                <p>कृपया दूसरी तारीख चुनें</p>
            </div>
        `;
        document.getElementById("nextBtn").style.display = "none";
        document.getElementById("exp-container").innerHTML = "";
    }
}

function selectDate() {
    const dateInput = document.getElementById("date-picker");
    if (dateInput.value) {
        const selectedDate = new Date(dateInput.value);
        
        // Check if the selected date has MCQ data
        checkDateHasData(selectedDate).then(hasData => {
            if (hasData) {
                currentDate = selectedDate;
                index = 0;
                answered = false;
                document.getElementById("exp-container").innerHTML = "";
                loadQuestions(currentDate);
            } else {
                // Show error message for dates without data
                document.getElementById("mcq-box").innerHTML = `
                    <div class="no-data">
                        <h3>📅 ${selectedDate.getDate()} ${selectedDate.toLocaleString('en-US', { month: 'long' })} ${selectedDate.getFullYear()}</h3>
                        <p>इस तारीख के लिए MCQ अभी उपलब्ध नहीं हैं</p>
                        <p>कृपया दूसरी तारीख चुनें</p>
                    </div>
                `;
                document.getElementById("nextBtn").style.display = "none";
                document.getElementById("exp-container").innerHTML = "";
                // Reset the date picker to current date
                dateInput.value = currentDate.toISOString().split('T')[0];
            }
        });
    }
}

function loadQuestion() {
    answered = false;
    document.getElementById("nextBtn").disabled = true;

    const q = questions[index];
    let html = `<h3>Q.${index + 1} ${q.q}</h3>`;

    q.options.forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        html += `
          <div class="option" onclick="checkAnswer(this,'${opt}')">
            ${letter}. ${opt}
          </div>`;
    });

    document.getElementById("mcq-box").innerHTML = html;
}

function checkAnswer(element, selected) {
    if (answered) return;
    answered = true;

    const correct = questions[index].ans;
    const options = document.querySelectorAll(".option");

    options.forEach(opt => {
        if (opt.innerText.includes(correct)) {
            opt.classList.add("correct");
        }
    });

    if (!element.innerText.includes(correct)) {
        element.classList.add("wrong");
    }

    const expContainer = document.getElementById("exp-container");
    expContainer.innerHTML = `<div class="explanation show"><b>Explanation:</b> ${questions[index].exp}</div>`;
    document.getElementById("nextBtn").disabled = false;
}

function nextQuestion() {
    index++;
    document.getElementById("exp-container").innerHTML = "";
    if (index < questions.length) {
        loadQuestion();
    } else {
    const box = document.getElementById("mcq-box");

    box.innerHTML = `
        <div class="end-screen">
            <h1>🎉 ज्ञान • इतिहास • सफलता!</h1>
            <p>
                आपने आज के सभी महत्वपूर्ण प्रश्न<br>
                सफलतापूर्वक complete कर लिए हैं ✅
            </p>
            <p class="brand-message">
                "Yaad rakhiye, exam yahin se niklega"<br>
                Rajguru bol raha hoon – likh ke le lo!
            </p>

            <div class="cta">
                <span>📘 Rajguru Classes</span><br>
                <b>Rajasthan GK | History | One-Shot Revision</b>
            </div>

            <a class="end-subscribe"
               href="https://www.youtube.com/@RajguruClasses"
               target="_blank">
               🔔 जहाँ तैयारी बने जीत की गारंटी
            </a>
        </div>
    `;

    document.getElementById("nextBtn").style.display = "none";
}
}

// Initial load - check if current date has data
(async function() {
    const hasData = await checkDateHasData(currentDate);
    if (hasData) {
        loadQuestions(currentDate);
    } else {
        // Find the nearest date with data (search backwards from current date)
        let checkDate = new Date(currentDate);
        for (let i = 0; i < 31; i++) {
            checkDate.setDate(checkDate.getDate() - 1);
            if (await checkDateHasData(checkDate)) {
                currentDate = checkDate;
                loadQuestions(currentDate);
                break;
            }
        }
        // If no data found, show message
        if (!hasData) {
            document.getElementById("mcq-box").innerHTML = `
                <div class="no-data">
                    <h3>📅 No MCQ Data Available</h3>
                    <p>कोई भी MCQ डेटा उपलब्ध नहीं है</p>
                    <p>कृपया बाद में जांचें</p>
                </div>
            `;
            document.getElementById("nextBtn").style.display = "none";
        }
    }
})();

