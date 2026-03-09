// ==================== HELPER FUNCTIONS ====================

// Create synonym badges
const createElements = (arr) => {
  if (!arr || !Array.isArray(arr)) return '';
  return arr.map(el => `<span class="btn btn-sm btn-outline btn-info m-1">${el}</span>`).join(" ");
};

// Text-to-speech
function pronounceWord(word) {
  if (!word) return;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}

// Spinner management
const manageSpinner = (status) => {
  const spinner = document.getElementById("spinner");
  const wordContainer = document.getElementById("word-container");
  if (status) {
    spinner?.classList.remove("hidden");
    wordContainer?.classList.add("hidden");
  } else {
    wordContainer?.classList.remove("hidden");
    spinner?.classList.add("hidden");
  }
};

// Remove active class from all lesson buttons
const removeActive = () => {
  document.querySelectorAll(".lesson-btn").forEach(btn => btn.classList.remove("active"));
};

// ==================== API FUNCTIONS ====================

// Load all lessons
const loadLessons = () => {
  fetch("https://openapi.programming-hero.com/api/levels/all")
    .then(res => res.json())
    .then(json => displayLesson(json.data))
    .catch(err => console.warn('Lesson fetch error:', err));
};

// Load words by level ID
const loadLevelWord = (id) => {
  manageSpinner(true);
  fetch(`https://openapi.programming-hero.com/api/level/${id}`)
    .then(res => res.json())
    .then(data => {
      removeActive();
      const clickedBtn = document.getElementById(`lesson-btn-${id}`);
      if (clickedBtn) clickedBtn.classList.add("active");
      displayLevelWord(data.data || []);
    })
    .catch(() => {
      manageSpinner(false);
      document.getElementById("word-container").innerHTML = `<div class="col-span-full text-center text-red-500">Failed to load words.</div>`;
    });
};

// Load single word details
const loadWordDetail = async (id) => {
  try {
    const res = await fetch(`https://openapi.programming-hero.com/api/word/${id}`);
    const json = await res.json();
    displayWordDetails(json.data);
  } catch {
    alert('Could not load details');
  }
};

// ==================== DISPLAY FUNCTIONS ====================

// Display word details in modal
const displayWordDetails = (word) => {
  const detailsBox = document.getElementById("details-container");
  detailsBox.innerHTML = `
    <div><h2 class="text-2xl font-bold">${word.word || ''} <i class="fa-solid fa-microphone-lines"></i> : ${word.pronunciation || ''}</h2></div>
    <div><h2 class="font-bold">Meaning</h2><p>${word.meaning || '—'}</p></div>
    <div><h2 class="font-bold">Example</h2><p>${word.sentence || '—'}</p></div>
    <div><h2 class="font-bold">Synonym</h2><div class="flex flex-wrap">${createElements(word.synonyms)}</div></div>
  `;
  document.getElementById("word_modal").showModal();
};

// Display words in grid
const displayLevelWord = (words) => {
  const container = document.getElementById("word-container");
  container.innerHTML = "";

  if (!words || words.length === 0) {
    container.innerHTML = `
      <div class="text-center col-span-full rounded-xl py-16 space-y-4 font-bangla bg-sky-50">
        <img class="mx-auto w-24" src="./assets/alert-error.png" alt="no data"/>
        <p class="text-xl text-gray-500">এই Lesson এ এখনো কোন Vocabulary যুক্ত করা হয়নি।</p>
        <h2 class="font-bold text-3xl">নেক্সট Lesson এ যান</h2>
      </div>
    `;
    manageSpinner(false);
    return;
  }

  words.forEach(word => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-xl shadow-sm text-center py-6 px-4 space-y-3 word-card";
    card.innerHTML = `
      <h2 class="font-bold text-2xl">${word.word || 'শব্দ'}</h2>
      <p class="font-semibold text-gray-600">Meaning / Pronunciation</p>
      <div class="text-xl font-medium font-bangla">"${word.meaning || 'অর্থ'}" / ${word.pronunciation || '—'}</div>
      <div class="flex justify-between items-center pt-3">
        <button class="btn bg-[#1A91FF10] hover:bg-[#1A91FF80] border-0 info-btn"><i class="fa-solid fa-circle-info"></i></button>
        <button class="btn bg-[#1A91FF10] hover:bg-[#1A91FF80] border-0 volume-btn"><i class="fa-solid fa-volume-high"></i></button>
      </div>
    `;
    
    // Attach event listeners
    const [infoBtn, volumeBtn] = card.querySelectorAll('button');
    infoBtn.onclick = () => loadWordDetail(word.id);
    volumeBtn.onclick = () => pronounceWord(word.word);
    
    container.appendChild(card);
  });
  manageSpinner(false);
};

// Display lesson buttons
const displayLesson = (lessons) => {
  const container = document.getElementById("level-container");
  container.innerHTML = "";
  lessons?.forEach(lesson => {
    const btnDiv = document.createElement("div");
    btnDiv.innerHTML = `
      <button id="lesson-btn-${lesson.level_no}" onclick="loadLevelWord(${lesson.level_no})" class="btn btn-outline btn-primary lesson-btn">
        <i class="fa-solid fa-book-open"></i> Lesson - ${lesson.level_no}
      </button>
    `;
    container.appendChild(btnDiv);
  });
};

// ==================== SEARCH FUNCTIONALITY ====================

document.getElementById("btn-search").addEventListener("click", () => {
  const input = document.getElementById("input-search");
  const term = input.value.trim().toLowerCase();
  if (!term) {
    alert('Please enter a word to search');
    return;
  }
  
  removeActive(); // Remove lesson active state
  manageSpinner(true);

  fetch("https://openapi.programming-hero.com/api/words/all")
    .then(res => res.json())
    .then(data => {
      const all = data.data || [];
      const filtered = all.filter(item => item.word?.toLowerCase().includes(term));
      displayLevelWord(filtered);
    })
    .catch(() => {
      manageSpinner(false);
      document.getElementById("word-container").innerHTML = `<div class="col-span-full text-center text-red-500">Search error</div>`;
    });
});

// ==================== LOGOUT FUNCTIONALITY ====================

const logoutHandler = (e) => {
  e.preventDefault();
  removeActive();
  document.getElementById("word-container").innerHTML = `
    <div class="text-center bg-sky-50 col-span-full rounded-xl py-16 space-y-6 font-bangla">
      <p class="text-xl font-medium text-gray-400">আপনি এখনো কোন Lesson Select করেন নি</p>
      <h2 class="font-bold text-4xl">একটি Lesson Select করুন।</h2>
    </div>
  `;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

document.getElementById("logoutMobile")?.addEventListener("click", logoutHandler);
document.getElementById("logoutDesktop")?.addEventListener("click", logoutHandler);

// ==================== SMOOTH SCROLL FOR ANCHOR LINKS ====================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === "#") return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ==================== INTERSECTION OBSERVER FOR FADE-UP ANIMATION ====================

const faders = document.querySelectorAll('.fade-up');
const appearOptions = { threshold: 0.2, rootMargin: '0px 0px -30px 0px' };
const appearOnScroll = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('appear');
    observer.unobserve(entry.target);
  });
}, appearOptions);

faders.forEach(fader => appearOnScroll.observe(fader));

// ==================== INITIAL LOAD ====================

loadLessons();