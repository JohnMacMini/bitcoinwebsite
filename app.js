(function () {
  const content = window.VFB_CONTENT;
  const STATE_ABBREVIATIONS = {
    Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
    Colorado: "CO", Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA",
    Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA",
    Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
    Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS", Missouri: "MO",
    Montana: "MT", Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH", "New Jersey": "NJ",
    "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND",
    Ohio: "OH", Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI",
    "South Carolina": "SC", "South Dakota": "SD", Tennessee: "TN", Texas: "TX",
    Utah: "UT", Vermont: "VT", Virginia: "VA", Washington: "WA", "West Virginia": "WV",
    Wisconsin: "WI", Wyoming: "WY",
  };
  const searchInput = document.querySelector("#search-input");
  const chamberFilter = document.querySelector("#chamber-filter");
  const stateFilter = document.querySelector("#state-filter");
  const stanceFilter = document.querySelector("#stance-filter");
  const resetFiltersButton = document.querySelector("#reset-filters");
  const directorySummary = document.querySelector("#directory-summary");
  const senatorList = document.querySelector("#senator-list");
  const senatorDetail = document.querySelector("#senator-detail");
  const resourceList = document.querySelector("#resource-list");
  const methodologyList = document.querySelector("#methodology-list");
  const stanceSummary = document.querySelector("#stance-summary");

  let activeSlug = content.senators[0]?.slug || "";

  function populateChamberFilter() {
    const chambers = [...new Set(content.senators.map((senator) => senator.chamber))];
    chambers.forEach((chamber) => {
      const option = document.createElement("option");
      option.value = chamber;
      option.textContent = chamber;
      chamberFilter.append(option);
    });
  }

  function populateStateFilter() {
    const states = [...new Set(content.senators.map((senator) => senator.state))].sort();
    states.forEach((state) => {
      const option = document.createElement("option");
      option.value = state;
      option.textContent = state;
      stateFilter.append(option);
    });
  }

  function populateStanceFilter() {
    content.stanceLabels.forEach((label) => {
      const option = document.createElement("option");
      option.value = label;
      option.textContent = label;
      stanceFilter.append(option);
    });
  }

  function createStateLink(state) {
    const href = `./?state=${encodeURIComponent(state)}`;
    return `<a class="state-link" href="${href}" data-state-link="${state}">${state}</a>`;
  }

  function createStanceLink(stance, tone) {
    const params = new URLSearchParams();
    if (chamberFilter.value !== "all") {
      params.set("chamber", chamberFilter.value);
    }
    if (stateFilter.value !== "all") {
      params.set("state", stateFilter.value);
    }
    params.set("stance", stance);
    const href = `./?${params.toString()}`;
    return `<a class="tag" data-tone="${tone}" href="${href}" data-stance-link="${stance}">${stance}</a>`;
  }

  function getContactUrl(lawmaker) {
    if (lawmaker.chamber === "Senate") {
      const code = STATE_ABBREVIATIONS[lawmaker.state];
      return code
        ? `https://www.senate.gov/senators/senators-contact.htm?State=${encodeURIComponent(code)}`
        : "https://www.senate.gov/senators/senators-contact.htm";
    }
    return "https://www.house.gov/representatives/find-your-representative";
  }

  function buildLawmakerTemplate(lawmaker) {
    return `Subject: Request for ${lawmaker.name}'s position on Bitcoin\n\nDear ${lawmaker.chamber === "Senate" ? "Senator" : "Representative"} ${lawmaker.name},\n\nI am writing as a constituent or prospective voter to ask for a clear public statement on your position regarding Bitcoin.\n\nI would appreciate your view on:\n- Bitcoin as distinct from the broader crypto market\n- Self-custody rights for Bitcoin holders\n- Bitcoin mining and energy policy\n- Whether you support or oppose Bitcoin-specific legislation\n\nIf you have already made a public statement, introduced legislation, or taken a vote related to Bitcoin, I would appreciate being pointed to it.\n\nThank you for your time.\n`;
  }

  function getResponseStatusMarkup(lawmaker) {
    const status = lawmaker.responseStatus || "No response received";
    return `<span class="response-status">${status}</span>`;
  }

  function applyStanceFromLocation() {
    const params = new URLSearchParams(window.location.search);
    const chamber = params.get("chamber");
    const stance = params.get("stance");
    const state = params.get("state");

    const knownChambers = new Set(content.senators.map((senator) => senator.chamber));
    if (chamber && knownChambers.has(chamber)) {
      chamberFilter.value = chamber;
    } else if (!chamber && chamberFilter.value !== "all") {
      chamberFilter.value = "all";
    }

    if (stance && content.stanceLabels.includes(stance)) {
      stanceFilter.value = stance;
    } else if (!stance && stanceFilter.value !== "all") {
      stanceFilter.value = "all";
    }

    const knownStates = new Set(content.senators.map((senator) => senator.state));
    if (state && knownStates.has(state)) {
      stateFilter.value = state;
    } else if (!state && stateFilter.value !== "all") {
      stateFilter.value = "all";
    }
  }

  function updateLocationForCurrentFilter() {
    const params = new URLSearchParams();
    if (chamberFilter.value !== "all") {
      params.set("chamber", chamberFilter.value);
    }
    if (stateFilter.value !== "all") {
      params.set("state", stateFilter.value);
    }
    if (stanceFilter.value !== "all") {
      params.set("stance", stanceFilter.value);
    }
    const nextUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
      history.replaceState(null, "", nextUrl);
    }
  }

  function getFilteredSenators() {
    const query = searchInput.value.trim().toLowerCase();
    const stance = stanceFilter.value;
    const hasActiveDiscoveryFilter =
      Boolean(query) ||
      chamberFilter.value !== "all" ||
      stateFilter.value !== "all";

    return content.senators.filter((senator) => {
      const isUnreviewed =
        senator.stance === "No Clear Public Position" &&
        senator.evidence.length === 0 &&
        senator.policySignals.includes("Full Bitcoin stance review pending.");
      const matchesQuery =
        !query ||
        [senator.name, senator.state, senator.party, senator.stance]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesState =
        stateFilter.value === "all" || senator.state === stateFilter.value;
      const matchesChamber =
        chamberFilter.value === "all" || senator.chamber === chamberFilter.value;
      const matchesStance =
        stance === "all"
          ? (!isUnreviewed || hasActiveDiscoveryFilter)
          : stance === "unreviewed"
            ? isUnreviewed
            : senator.stance === stance;
      return matchesQuery && matchesState && matchesChamber && matchesStance;
    });
  }

  function renderDirectorySummary(senators) {
    const chamberText =
      chamberFilter.value === "all" ? "both chambers" : chamberFilter.value;
    const stateText =
      stateFilter.value === "all" ? "all states" : stateFilter.value;
    const stanceText =
      stanceFilter.value === "all"
        ? hasDefaultView()
          ? "reviewed stance categories"
          : "all matching lawmaker profiles"
        : stanceFilter.value === "unreviewed"
          ? "unreviewed lawmakers"
          : stanceFilter.value;
    const countText = `${senators.length} profile${senators.length === 1 ? "" : "s"}`;
    directorySummary.textContent = `Showing ${countText} for ${chamberText} in ${stateText} across ${stanceText}.`;
  }

  function hasDefaultView() {
    return (
      !searchInput.value.trim() &&
      chamberFilter.value === "all" &&
      stateFilter.value === "all" &&
      stanceFilter.value === "all"
    );
  }

  function renderSenatorList() {
    const senators = getFilteredSenators();
    senatorList.innerHTML = "";
    renderDirectorySummary(senators);

    if (!senators.length) {
      senatorList.innerHTML =
        '<div class="senator-card"><strong>No matches found.</strong><p class="senator-summary">Try a broader search or reset the stance filter.</p></div>';
      senatorDetail.innerHTML =
        '<div class="detail-copy"><p class="eyebrow">Directory status</p><h2>Nothing matched that filter.</h2><p>Adjust the search terms to view a senator profile.</p></div>';
      return;
    }

    if (!senators.some((senator) => senator.slug === activeSlug)) {
      activeSlug = senators[0].slug;
    }

    senators.forEach((senator) => {
      const card = document.createElement("button");
      card.className = "senator-card";
      card.type = "button";
      if (senator.slug === activeSlug) {
        card.classList.add("is-active");
      }

      card.innerHTML = `
        <div class="senator-card-top">
          <div>
            <h3>${senator.name}</h3>
            <div class="senator-meta">${senator.chamber} · ${senator.party} · ${createStateLink(senator.state)}</div>
          </div>
          ${createStanceLink(senator.stance, senator.tone)}
        </div>
        <p class="senator-summary">${senator.summary}</p>
      `;

      card.addEventListener("click", () => {
        activeSlug = senator.slug;
        renderSenatorList();
        renderDetail();
      });

      senatorList.append(card);
    });
  }

  function renderDetail() {
    const senator = content.senators.find((item) => item.slug === activeSlug);
    if (!senator) {
      return;
    }

    senatorDetail.innerHTML = `
      <div class="detail-copy">
        <div>
          <p class="eyebrow">Selected profile</p>
          <div class="detail-top">
            <div>
              <h2>${senator.name}</h2>
              <p class="detail-kicker">${senator.chamber} · ${senator.party} · ${createStateLink(senator.state)}</p>
            </div>
            <div>
              ${createStanceLink(senator.stance, senator.tone)}
            </div>
          </div>
          <ul class="detail-meta">
            <li><strong>Confidence:</strong> <span class="confidence">${senator.confidence}</span></li>
            <li><strong>Last reviewed:</strong> ${senator.lastReviewed}</li>
            <li><strong>Office response:</strong> ${getResponseStatusMarkup(senator)}</li>
          </ul>
        </div>

        <div>
          <h3>Plain-language read</h3>
          <p>${senator.summary}</p>
        </div>

        <div>
          <h3>Policy signals</h3>
          <ul class="source-list">
            ${senator.policySignals.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>

        <div>
          <h3>Public evidence</h3>
          <div class="evidence-grid">
            ${
              senator.evidence.length
                ? senator.evidence
                    .map(
                      (item) => `
                        <article class="evidence-card">
                          <strong>${item.title}</strong>
                          <p class="evidence-meta">${item.sourceType} · ${item.date}</p>
                          <p>${item.note}</p>
                          <a href="${item.url}" target="_blank" rel="noreferrer">Open source</a>
                        </article>
                      `,
                    )
                    .join("")
                : `
                    <article class="evidence-card">
                      <strong>No sourced evidence added yet</strong>
                      <p class="evidence-meta">Profile review pending</p>
                      <p>This lawmaker is included in the directory so the roster is complete, but a full Bitcoin-specific source review has not been added to this profile yet.</p>
                    </article>
                  `
            }
          </div>
        </div>

        <div>
          <h3>Request a public position</h3>
          <article class="contact-card">
            <p>
              Use a short constituent message to ask this office for a clear
              Bitcoin position. Many congressional offices use official contact
              forms rather than publishing direct email addresses.
            </p>
            <div class="contact-actions">
              <button class="button button-primary button-small" type="button" data-copy-lawmaker-template="${senator.slug}">Copy message template</button>
              <a class="button button-secondary button-small" href="${getContactUrl(senator)}" target="_blank" rel="noreferrer">Contact office</a>
              <a class="button button-secondary button-small" href="./survey.html">Official response survey</a>
            </div>
          </article>
        </div>
      </div>
    `;
  }

  function renderResources() {
    resourceList.innerHTML = content.resources
      .map(
        (resource) => `
          <article class="resource-card">
            <p class="resource-type">${resource.category}</p>
            <h3>${resource.title}</h3>
            <p>${resource.description}</p>
            <a href="${resource.url}" ${
              resource.external ? 'target="_blank" rel="noreferrer"' : ""
            }>${resource.linkLabel || "Visit resource"}</a>
          </article>
        `,
      )
      .join("");
  }

  function renderMethodology() {
    methodologyList.innerHTML = content.methodology
      .map(
        (section) => `
          <article class="methodology-card">
            <h3>${section.title}</h3>
            <p>${section.body}</p>
            <ul>
              ${section.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
            </ul>
          </article>
        `,
      )
      .join("");
  }

  function renderStanceSummary() {
    const counts = content.stanceLabels.map((label) => ({
      label,
      count: content.senators.filter((senator) => senator.stance === label).length,
    }));

    stanceSummary.innerHTML = counts
      .filter((item) => item.count > 0)
      .map(
        (item) => `
          <article class="snapshot-card">
            <strong>${item.count}</strong>
            <h3><a href="./?stance=${encodeURIComponent(item.label)}" data-stance-link="${item.label}">${item.label}</a></h3>
            <p>Profiles currently shown in this category.</p>
          </article>
        `,
      )
      .join("");
  }

  function rerenderDirectory(updateHash = true) {
    renderSenatorList();
    renderDetail();
    if (updateHash) {
      updateLocationForCurrentFilter();
    }
  }

  populateStateFilter();
  populateChamberFilter();
  populateStanceFilter();
  renderResources();
  renderMethodology();
  renderStanceSummary();
  applyStanceFromLocation();
  rerenderDirectory();

  searchInput.addEventListener("input", rerenderDirectory);
  chamberFilter.addEventListener("change", rerenderDirectory);
  stateFilter.addEventListener("change", rerenderDirectory);
  stanceFilter.addEventListener("change", rerenderDirectory);
  resetFiltersButton.addEventListener("click", () => {
    searchInput.value = "";
    chamberFilter.value = "all";
    stateFilter.value = "all";
    stanceFilter.value = "all";
    history.replaceState(null, "", window.location.pathname);
    renderSenatorList();
    renderDetail();
  });

  document.addEventListener("click", (event) => {
    const templateButton = event.target.closest("[data-copy-lawmaker-template]");
    if (templateButton) {
      const slug = templateButton.getAttribute("data-copy-lawmaker-template");
      const lawmaker = content.senators.find((item) => item.slug === slug);
      if (!lawmaker) {
        return;
      }
      navigator.clipboard
        .writeText(buildLawmakerTemplate(lawmaker))
        .then(() => {
          templateButton.textContent = "Copied";
          window.setTimeout(() => {
            templateButton.textContent = "Copy message template";
          }, 1600);
        })
        .catch(() => {
          templateButton.textContent = "Copy failed";
          window.setTimeout(() => {
            templateButton.textContent = "Copy message template";
          }, 1600);
        });
      return;
    }

    const link = event.target.closest("[data-stance-link]");
    if (!link) {
      const stateLink = event.target.closest("[data-state-link]");
      if (!stateLink) {
        return;
      }
      const state = stateLink.getAttribute("data-state-link");
      if (!state) {
        return;
      }
      event.preventDefault();
      stateFilter.value = state;
      updateLocationForCurrentFilter();
      renderSenatorList();
      renderDetail();
      return;
    }
    const stance = link.getAttribute("data-stance-link");
    if (!stance) {
      return;
    }
    event.preventDefault();
    stanceFilter.value = stance;
    updateLocationForCurrentFilter();
    renderSenatorList();
    renderDetail();
  });
})();
