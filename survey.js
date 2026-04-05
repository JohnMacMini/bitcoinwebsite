(function () {
  const button = document.querySelector("#copy-survey-questions");

  if (!button) {
    return;
  }

  const surveyQuestions = [
    "Bitcoin Policy Survey Questions",
    "",
    "1. Is Bitcoin distinct from the broader crypto market?",
    "2. Does the office support the right to self-custody Bitcoin?",
    "3. Does the office support lawful Bitcoin mining in the United States?",
    "4. Does the office support Bitcoin-specific federal legislation if aligned with its principles?",
    "5. What is the office's current overall position on Bitcoin?",
    "",
    "Optional clarification:",
    "Anything else the office wants voters to know about its Bitcoin position.",
  ].join("\n");

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(surveyQuestions);
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = "Copy survey questions";
      }, 1600);
    } catch (_error) {
      button.textContent = "Copy failed";
      window.setTimeout(() => {
        button.textContent = "Copy survey questions";
      }, 1600);
    }
  });
})();
