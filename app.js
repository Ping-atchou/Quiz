/********************
 * CONFIGURATION
 ********************/
const SHUFFLE_QUESTIONS = true;
const SHUFFLE_OPTIONS   = true;

/********************
 * ASSETS (réglage extension ICI)
 * Mets "svg" si tes fichiers sont Tabouret1.svg / 2.svg / 3.svg
 * Mets "png" si ce sont des .png
 ********************/
const ASSET_EXT = "svg"; // ← change en "png" si besoin
const TABOURETS = [
  `assets/Tabouret1.${ASSET_EXT}`,
  `assets/Tabouret2.${ASSET_EXT}`,
  `assets/Tabouret3.${ASSET_EXT}`,
];

/********************
 * DONNÉES DU QUIZ
 ********************/
const QUESTIONS = [
  {
    text: "Quelle est la capitale du Canada ?",
    options: [
      { text: "Ottawa",   correct: true,  info: "Ottawa est la capitale depuis 1857." },
      { text: "Toronto",  correct: false, info: "Toronto est la plus grande ville, pas la capitale." },
      { text: "Montréal", correct: false, info: "Montréal est la métropole du Québec." }
    ]
  },
  {
    text: "Combien y a-t-il de provinces au Canada ?",
    options: [
      { text: "10", correct: true,  info: "Il y a 10 provinces et 3 territoires." },
      { text: "9",  correct: false, info: "Il en manque une." },
      { text: "12", correct: false, info: "Ce total inclut des territoires." }
    ]
  },
  {
    text: "Le fleuve qui traverse Montréal est…",
    options: [
      { text: "Saint-Laurent", correct: true,  info: "Il relie les Grands Lacs à l’Atlantique." },
      { text: "Fraser",        correct: false, info: "Le Fraser est en Colombie-Britannique." },
      { text: "Mackenzie",     correct: false, info: "Le Mackenzie coule dans les T.N.-O." }
    ]
  },
  // ➜ Ajoute tes questions ici au même format (3 options).
];

/********************
 * UTILITAIRES
 ********************/
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
const $ = (id) => document.getElementById(id);

function setMarkerPosition(displayIndex) {
  const marker = $("marker");
  marker.classList.remove("pos-0", "pos-1", "pos-2");
  marker.classList.add(`pos-${displayIndex}`);
  marker.classList.remove("shake");
  requestAnimationFrame(() => marker.classList.add("shake"));
}

/* Déplacer + changer l'image du tabouret */
function setMarkerAppearance(displayIndex) {
  // Déplacement gauche(0)/centre(1)/droite(2)
  setMarkerPosition(displayIndex);

  // Changement d'image
  const img = document.querySelector("#marker img");
  if (img && TABOURETS[displayIndex]) {
    img.src = TABOURETS[displayIndex];
  }
}

/* Précharger pour éviter un clignotement */
(function preload() {
  TABOURETS.forEach(src => { const i = new Image(); i.src = src; });
})();

/********************
 * ÉTAT DU QUIZ
 ********************/
const state = {
  order: [],
  qIndex: 0,
  score: 0,
  current: null,
  displayOrder: [0,1,2],
  locked: false
};

/********************
 * LOGIQUE
 ********************/
function initQuiz() {
  state.order = Array.from({length: QUESTIONS.length}, (_, i) => i);
  if (SHUFFLE_QUESTIONS) shuffle(state.order);

  state.qIndex = 0;
  state.score = 0;

  $("score").textContent = `Score : ${state.score}`;

  // Position + image de départ = centre (Tabouret2)
  $("marker").className = "marker pos-1";
  const img = document.querySelector("#marker img");
  if (img) img.src = TABOURETS[1];

  loadCurrent();
}

function loadCurrent() {
  state.locked = false;
  $("feedback").style.display = "none";
  $("info").textContent = "";
  $("status").textContent = "";

  const realIndex = state.order[state.qIndex];
  state.current = QUESTIONS[realIndex];

  $("question").textContent = state.current.text;
  $("progress").textContent = `${state.qIndex + 1} / ${QUESTIONS.length}`;

  state.displayOrder = [0,1,2];
  if (SHUFFLE_OPTIONS) shuffle(state.displayOrder);

  renderChoices();
}

function renderChoices() {
  const container = $("choices");
  container.innerHTML = "";

  state.displayOrder.forEach((optDisplayIndex, displaySlot) => {
    const opt = state.current.options[optDisplayIndex];

    const btn = document.createElement("button");
    btn.className = "btn";
    btn.setAttribute("role", "button");
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML = `<strong>${String.fromCharCode(65 + displaySlot)}.</strong> ${opt.text}`;

    btn.addEventListener("click", () => {
      if (state.locked) return;
      state.locked = true;

      // 👇 Déplacement + image selon le bouton cliqué
      setMarkerAppearance(displaySlot);

      // Feedback
      const isCorrect = !!opt.correct;
      if (isCorrect) {
        state.score++;
        $("status").textContent = "✅ Bonne réponse !";
        $("status").className = "status ok";
      } else {
        $("status").textContent = "❌ Mauvaise réponse.";
        $("status").className = "status ko";
      }

      $("info").textContent = opt.info || "";
      $("feedback").style.display = "grid";
      $("score").textContent = `Score : ${state.score}`;

      Array.from(document.querySelectorAll(".btn")).forEach(b => b.disabled = true);
    });

    container.appendChild(btn);
  });
}

/********************
 * ÉCOUTEURS
 ********************/
$("nextBtn").addEventListener("click", () => {
  if (state.qIndex < state.order.length - 1) {
    state.qIndex++;
    loadCurrent();
  } else {
    $("question").textContent = "🎉 Quiz terminé !";
    $("choices").innerHTML = "";
    $("feedback").style.display = "grid";
    $("status").textContent = "Bilan";
    $("status").className = "status ok";
    $("info").textContent = `Votre score final : ${state.score} / ${QUESTIONS.length}`;
  }

  // Recentrer et remettre Tabouret2 au chargement suivant
  $("marker").className = "marker pos-1";
  const img = document.querySelector("#marker img");
  if (img) img.src = TABOURETS[1];
});

$("resetBtn").addEventListener("click", () => {
  initQuiz();
});

/********************
 * DÉMARRAGE
 ********************/
initQuiz();