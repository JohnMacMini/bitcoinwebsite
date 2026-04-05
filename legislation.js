(function () {
  const content = window.VFB_CONTENT;
  const SENATE_CONTACT_URL = "https://www.senate.gov/senators/senators-contact.htm";
  const HOUSE_CONTACT_URL = "https://www.house.gov/representatives/find-your-representative";
  const billCount = document.querySelector("#bill-count");
  const voteSummary = document.querySelector("#vote-summary");
  const billList = document.querySelector("#bill-list");
  const statusList = document.querySelector("#status-list");
  const executiveOrderList = document.querySelector("#executive-order-list");
  const voteList = document.querySelector("#vote-list");

  let activeScope = "bitcoin";

  function renderBills(items) {
    billList.innerHTML = items
      .map(
        (bill) => `
          <article class="bill-card">
            <p class="eyebrow">${bill.chamber}</p>
            <h3>${bill.billNumber} · ${bill.title}</h3>
            <p>${bill.summary}</p>
            <div class="bill-meta">
              <span class="meta-pill">Introduced ${bill.introducedDate}</span>
              <span class="meta-pill">Latest action ${bill.latestActionDate}</span>
              <span class="meta-pill">${bill.status}</span>
            </div>
            <div class="bill-links">
              <a href="${bill.billUrl}" target="_blank" rel="noreferrer">Bill page</a>
              <a href="${bill.textUrl}" target="_blank" rel="noreferrer">Bill text</a>
              <a href="${bill.sourceUrl}" target="_blank" rel="noreferrer">Supporting source</a>
            </div>
            <p class="page-note">${bill.scopeNote}</p>
            <div class="card-actions">
              <button class="button button-primary button-small" type="button" data-copy-bill-template="${bill.billNumber}">Copy outreach template</button>
              <a class="button button-secondary button-small" href="${bill.chamber === "House bill" ? HOUSE_CONTACT_URL : SENATE_CONTACT_URL}" target="_blank" rel="noreferrer">${bill.chamber === "House bill" ? "Find your representative" : "Find your senators"}</a>
            </div>
          </article>
        `,
      )
      .join("");
  }

  function renderOrders(items) {
    executiveOrderList.innerHTML = items
      .map(
        (order) => `
          <article class="bill-card">
            <p class="eyebrow">Executive Order</p>
            <h3>${order.orderNumber} · ${order.title}</h3>
            <p>${order.summary}</p>
            <div class="bill-meta">
              <span class="meta-pill">Issued ${order.issuedDate}</span>
              <span class="meta-pill">${order.status}</span>
            </div>
            <div class="bill-links">
              <a href="${order.whiteHouseUrl}" target="_blank" rel="noreferrer">White House text</a>
              <a href="${order.federalRegisterUrl}" target="_blank" rel="noreferrer">Federal Register</a>
              <a href="${order.factSheetUrl}" target="_blank" rel="noreferrer">Fact sheet</a>
            </div>
            <p class="page-note">${order.scopeNote}</p>
          </article>
        `,
      )
      .join("");
  }

  function renderVotes(votes, emptyState) {
    if (!votes.length) {
      voteList.innerHTML = `
      <article class="vote-card">
        <p class="eyebrow">No recorded vote yet</p>
        <h3>${emptyState.title}</h3>
        <p>${emptyState.body}</p>
        <p>${emptyState.secondary}</p>
      </article>
      <article class="vote-card">
        <p class="eyebrow">Why the list is short</p>
        <h3>Strict scope keeps the page trustworthy.</h3>
        <p>
          The page is split into Bitcoin and Crypto so visitors can study a
          narrow Bitcoin lens without losing sight of broader digital asset
          policy. Recorded vote detail only appears when an official Senate roll
          call exists.
        </p>
      </article>
    `;
      return;
    }

    voteList.innerHTML = votes
      .map(
        (vote) => `
          <article class="vote-card">
            <p class="eyebrow">${vote.date}</p>
            <h3>${vote.title}</h3>
            <p>${vote.description}</p>
            <p class="evidence-meta">${vote.tally}</p>
            <a class="source-link" href="${vote.rollCallUrl}" target="_blank" rel="noreferrer">Open roll call source</a>
            <div class="senator-vote-list">
              ${vote.senators
                .map(
                  (senator) => `
                    <div class="senator-vote">
                      <strong>${senator.name}</strong>
                      <span class="tag" data-tone="${senator.tone}">${senator.vote}</span>
                    </div>
                  `,
                )
                .join("")}
            </div>
          </article>
        `,
      )
      .join("");
  }

  function renderScope() {
    const scope = content.legislation.scopes[activeScope];
    billCount.textContent = String(scope.bills.length + scope.executiveOrders.length);
    voteSummary.textContent = scope.voteSummary;

    renderBills(scope.bills);
    renderOrders(scope.executiveOrders);

    statusList.innerHTML = `
      <article class="status-card">
        <p class="eyebrow">Scope focus</p>
        <h3>${scope.statusCard.title}</h3>
        <p>${scope.statusCard.body}</p>
        <ul>
          ${scope.statusCard.points.map((point) => `<li>${point}</li>`).join("")}
        </ul>
      </article>
    `;

    renderVotes(scope.senateVotes, scope.emptyVoteState);
  }

  function buildBillTemplate(bill) {
    return `Subject: Request for a public position on ${bill.billNumber}\n\nDear Senator,\n\nI am writing to ask for a clear public position on ${bill.billNumber}, ${bill.title}.\n\nI would appreciate a response explaining whether you support, oppose, or are still reviewing this bill, and why.\n\nI am especially interested in how you view this bill's impact on Bitcoin policy and on constituents who care about Bitcoin.\n\nThank you for your time.\n`;
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-copy-bill-template]");
    if (!button) {
      return;
    }
    const billNumber = button.getAttribute("data-copy-bill-template");
    const scope = content.legislation.scopes[activeScope];
    const bill = scope.bills.find((item) => item.billNumber === billNumber);
    if (!bill) {
      return;
    }
    navigator.clipboard
      .writeText(buildBillTemplate(bill))
      .then(() => {
        button.textContent = "Copied";
        window.setTimeout(() => {
          button.textContent = "Copy outreach template";
        }, 1600);
      })
      .catch(() => {
        button.textContent = "Copy failed";
        window.setTimeout(() => {
          button.textContent = "Copy outreach template";
        }, 1600);
      });
  });

  function readScopeFromUrl() {
    const bodyScope = document.body.dataset.scope;
    if (bodyScope && content.legislation.scopes[bodyScope]) {
      activeScope = bodyScope;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const scope = params.get("scope");
    if (scope && content.legislation.scopes[scope]) {
      activeScope = scope;
    }
  }

  readScopeFromUrl();
  renderScope();
})();
