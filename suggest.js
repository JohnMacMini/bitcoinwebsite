(function () {
  const form = document.querySelector("#suggest-form");
  const output = document.querySelector("#suggest-output");
  const copyButton = document.querySelector("#copy-suggestion");

  if (!form || !output || !copyButton) {
    return;
  }

  function buildSummary() {
    const type = document.querySelector("#suggest-type").value.trim();
    const subject = document.querySelector("#suggest-subject").value.trim();
    const url = document.querySelector("#suggest-url").value.trim();
    const details = document.querySelector("#suggest-details").value.trim();
    const name = document.querySelector("#suggest-name").value.trim();

    const lines = [
      `Type: ${type || "Not provided"}`,
      `Subject: ${subject || "Not provided"}`,
      `Source URL: ${url || "Not provided"}`,
      "",
      "Details:",
      details || "Not provided",
      "",
      `Submitted by: ${name || "Anonymous"}`,
    ];

    return lines.join("\n");
  }

  function renderSummary() {
    output.textContent = buildSummary();
    output.classList.remove("is-hidden");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    renderSummary();

    const type = document.querySelector("#suggest-type").value.trim();
    const subject = document.querySelector("#suggest-subject").value.trim();
    const issueTitle = `[Suggestion] ${type}: ${subject}`;
    const issueBody = buildSummary();
    const issueUrl =
      "https://github.com/JohnMacMini/VotersForBitcoin/issues/new?title=" +
      encodeURIComponent(issueTitle) +
      "&body=" +
      encodeURIComponent(issueBody);

    window.open(issueUrl, "_blank", "noopener,noreferrer");
  });

  copyButton.addEventListener("click", async () => {
    renderSummary();
    try {
      await navigator.clipboard.writeText(output.textContent);
      copyButton.textContent = "Copied";
      window.setTimeout(() => {
        copyButton.textContent = "Copy summary";
      }, 1600);
    } catch (_error) {
      copyButton.textContent = "Copy failed";
      window.setTimeout(() => {
        copyButton.textContent = "Copy summary";
      }, 1600);
    }
  });
})();
