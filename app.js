const GITHUB_REPO = "YOUR_GITHUB_USERNAME/YOUR_REPO_NAME";

const DEFAULT_POSTS = [
  {
    id: 1,
    author: "Isiah Roddick Malixi",
    category: "Machine Review",
    date: "November 14, 2026",
    title: "Why Middleweight Parallel Twins Rule Everyday Riding",
    body: "You do not need 200 horsepower to enjoy a Sunday morning mountain pass. A balanced 400cc to 650cc parallel twin delivers usable low-end torque, lighter cornering flickability, and approachable maintenance.",
    comments: [
      { name: "Marco R.", text: "Completely agree. Easier to push near its limits safely on public roads." }
    ]
  },
  {
    id: 2,
    author: "Isiah Roddick Malixi",
    category: "Garage & Tech",
    date: "November 10, 2026",
    title: "Five-Minute Pre-Ride Inspection Checklist",
    body: "Before thumbing the starter, check chain slack, tire pressure, brake lever firmness, fork seals, and headlight operation. Consistency keeps small mechanical issues from becoming roadside headaches.",
    comments: []
  },
  {
    id: 3,
    author: "Isiah Roddick Malixi",
    category: "Ride Report",
    date: "November 03, 2026",
    title: "Sunrise Coastal Loop: Cold Air and Smooth Asphalt",
    body: "Rolling out at 5:30 AM before traffic builds turns familiar highways into a quiet ribbon of asphalt. Steady throttle control and smooth apex lines make all the difference.",
    comments: []
  }
];

function getPosts() {
  const saved = localStorage.getItem("moto_blog_posts_v1");
  if (saved) {
    return JSON.parse(saved);
  }
  localStorage.setItem("moto_blog_posts_v1", JSON.stringify(DEFAULT_POSTS));
  return DEFAULT_POSTS;
}

function savePosts(posts) {
  localStorage.setItem("moto_blog_posts_v1", JSON.stringify(posts));
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function mountGitHubComments(container, issueTerm) {
  if (!container) return;
  container.innerHTML = "";

  const isConfigured = GITHUB_REPO && !GITHUB_REPO.includes("YOUR_GITHUB_USERNAME");

  if (isConfigured) {
    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.setAttribute("repo", GITHUB_REPO);
    script.setAttribute("issue-term", issueTerm);
    script.setAttribute("theme", "github-light");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;
    container.appendChild(script);
  } else {
    const storageKey = "local_topic_comments_" + issueTerm;
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");

    const notice = document.createElement("div");
    notice.className = "setup-notice";
    notice.innerHTML = "<strong>GitHub Sync Ready:</strong> Set <code>GITHUB_REPO</code> in <code>app.js</code> to sync all visitor comments across GitHub Issues.";
    container.appendChild(notice);

    const list = document.createElement("div");
    existing.forEach(item => {
      const row = document.createElement("div");
      row.className = "comment-item";
      row.innerHTML = `<strong>${escapeHTML(item.name)}</strong><span>${escapeHTML(item.date)}</span><p>${escapeHTML(item.text)}</p>`;
      list.appendChild(row);
    });
    container.appendChild(list);

    const form = document.createElement("form");
    form.className = "inline-comment-form";
    form.innerHTML = `
      <input type="text" name="visitorName" placeholder="Your name" required>
      <input type="text" name="visitorComment" placeholder="Write a comment..." required>
      <button type="submit" class="btn btn-primary btn-sm">Post</button>
    `;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const nameVal = form.visitorName.value.trim();
      const textVal = form.visitorComment.value.trim();
      if (!nameVal || !textVal) return;

      existing.push({
        name: nameVal,
        text: textVal,
        date: new Date().toLocaleDateString()
      });
      localStorage.setItem(storageKey, JSON.stringify(existing));
      mountGitHubComments(container, issueTerm);
    });

    container.appendChild(form);
  }
}

function initJournalPage() {
  const postsContainer = document.getElementById("posts-container");
  const postForm = document.getElementById("post-form");
  const postCount = document.getElementById("post-count");

  if (!postsContainer) return;

  function renderPosts() {
    const posts = getPosts();
    postCount.textContent = `${posts.length} ${posts.length === 1 ? "Article" : "Articles"}`;
    postsContainer.innerHTML = "";

    posts.forEach(post => {
      const article = document.createElement("article");
      article.className = "card post-card";

      const commentsHTML = post.comments.map(c => `
        <div class="comment-item">
          <strong>${escapeHTML(c.name)}:</strong> ${escapeHTML(c.text)}
        </div>
      `).join("");

      article.innerHTML = `
        <div class="post-meta">
          <span class="post-tag">${escapeHTML(post.category)}</span>
          <span>&bull;</span>
          <span>${escapeHTML(post.date)}</span>
          <span>&bull;</span>
          <span>By ${escapeHTML(post.author)}</span>
        </div>
        <h3>${escapeHTML(post.title)}</h3>
        <p class="post-body">${escapeHTML(post.body)}</p>
        <div class="post-comments">
          <p class="small-text"><strong>Reader Notes (${post.comments.length})</strong></p>
          ${commentsHTML}
          <form class="inline-comment-form" data-post-id="${post.id}">
            <input type="text" name="commenter" placeholder="Your name" required>
            <input type="text" name="message" placeholder="Comment on this post..." required>
            <button type="submit" class="btn btn-outline btn-sm">Comment</button>
          </form>
        </div>
      `;

      postsContainer.appendChild(article);
    });

    document.querySelectorAll(".inline-comment-form[data-post-id]").forEach(form => {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const postId = Number(form.getAttribute("data-post-id"));
        const name = form.commenter.value.trim();
        const text = form.message.value.trim();
        if (!name || !text) return;

        const posts = getPosts();
        const target = posts.find(p => p.id === postId);
        if (target) {
          target.comments.push({ name, text });
          savePosts(posts);
          renderPosts();
        }
      });
    });
  }

  postForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const author = document.getElementById("post-author").value.trim() || "Isiah Roddick Malixi";
    const category = document.getElementById("post-category").value;
    const title = document.getElementById("post-title").value.trim();
    const body = document.getElementById("post-body").value.trim();

    if (!title || !body) return;

    const posts = getPosts();
    posts.unshift({
      id: Date.now(),
      author,
      category,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }),
      title,
      body,
      comments: []
    });

    savePosts(posts);
    postForm.reset();
    document.getElementById("post-author").value = "Isiah Roddick Malixi";
    renderPosts();
  });

  renderPosts();
}

function initCatalogPage() {
  const makesListEl = document.getElementById("makes-scroll-list");
  if (!makesListEl) return;

  const modelsListEl = document.getElementById("models-scroll-list");
  const makeSearchEl = document.getElementById("make-search");
  const yearSelectEl = document.getElementById("model-year");
  const makeCountEl = document.getElementById("make-count");
  const modelCountEl = document.getElementById("model-count");
  const modelsHeadingEl = document.getElementById("models-heading");

  const bikeTitleEl = document.getElementById("selected-bike-title");
  const bikeMetaEl = document.getElementById("selected-bike-meta");
  const bikeSpecsEl = document.getElementById("bike-specs-box");
  const bikeCommentsMount = document.getElementById("bike-comments-mount");

  let allMakes = [];
  let activeMake = null;

  async function fetchMotorcycleMakes() {
    try {
      const response = await fetch("https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/motorcycle?format=json");
      const data = await response.json();
      allMakes = (data.Results || []).sort((a, b) => a.MakeName.localeCompare(b.MakeName));
      renderMakes(allMakes);
    } catch (error) {
      makesListEl.innerHTML = "<p class='muted'>Unable to load NHTSA API right now. Please check your connection.</p>";
      makeCountEl.textContent = "Offline";
    }
  }

  function renderMakes(makes) {
    makeCountEl.textContent = `${makes.length} Makes`;
    makesListEl.innerHTML = "";

    if (makes.length === 0) {
      makesListEl.innerHTML = "<p class='muted'>No matching motorcycle manufacturers found.</p>";
      return;
    }

    makes.forEach(make => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "list-item-btn" + (activeMake && activeMake.MakeId === make.MakeId ? " selected" : "");
      btn.innerHTML = `<span>${escapeHTML(make.MakeName)}</span><span>&rsaquo;</span>`;

      btn.addEventListener("click", () => {
        activeMake = make;
        document.querySelectorAll("#makes-scroll-list .list-item-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        fetchModelsForMake(make);
      });

      makesListEl.appendChild(btn);
    });
  }

  async function fetchModelsForMake(make) {
    const year = yearSelectEl.value;
    modelsHeadingEl.textContent = `2. ${make.MakeName} (${year})`;
    modelCountEl.textContent = "Loading...";
    modelsListEl.innerHTML = "<p class='muted'>Fetching motorcycle models...</p>";

    try {
      const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeIdYear/makeId/${make.MakeId}/modelyear/${year}/vehicletype/motorcycle?format=json`;
      const response = await fetch(url);
      const data = await response.json();
      const models = data.Results || [];

      modelCountEl.textContent = `${models.length} Models`;
      modelsListEl.innerHTML = "";

      if (models.length === 0) {
        modelsListEl.innerHTML = `<p class="muted">No ${year} models listed for ${escapeHTML(make.MakeName)}. Try another year above.</p>`;
        return;
      }

      models.forEach(model => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "list-item-btn";
        btn.innerHTML = `<span>${escapeHTML(model.Model_Name)}</span><span>Discuss &rarr;</span>`;

        btn.addEventListener("click", () => {
          document.querySelectorAll("#models-scroll-list .list-item-btn").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
          selectMotorcycle(make, model, year);
        });

        modelsListEl.appendChild(btn);
      });
    } catch (error) {
      modelsListEl.innerHTML = "<p class='muted'>Error loading models from API.</p>";
      modelCountEl.textContent = "Error";
    }
  }

  function selectMotorcycle(make, model, year) {
    const fullTitle = `${year} ${make.MakeName} ${model.Model_Name}`;
    bikeTitleEl.textContent = fullTitle;
    bikeMetaEl.textContent = "Verified NHTSA vPIC Motorcycle Registry Record";

    bikeSpecsEl.classList.remove("hidden");
    bikeSpecsEl.innerHTML = `
      <p><strong>Manufacturer:</strong> ${escapeHTML(make.MakeName)} (ID: ${make.MakeId})</p>
      <p><strong>Model Name:</strong> ${escapeHTML(model.Model_Name)} (ID: ${model.Model_ID})</p>
      <p><strong>Model Year:</strong> ${escapeHTML(year)}</p>
      <p><strong>Vehicle Class:</strong> Motorcycle</p>
    `;

    const issueTopic = `bike-${year}-${make.MakeName}-${model.Model_Name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    mountGitHubComments(bikeCommentsMount, issueTopic);
  }

  makeSearchEl.addEventListener("input", function () {
    const query = makeSearchEl.value.trim().toLowerCase();
    const filtered = allMakes.filter(m => m.MakeName.toLowerCase().includes(query));
    renderMakes(filtered);
  });

  yearSelectEl.addEventListener("change", function () {
    if (activeMake) {
      fetchModelsForMake(activeMake);
    }
  });

  mountGitHubComments(bikeCommentsMount, "bike-catalog-general");
  fetchMotorcycleMakes();
}

document.addEventListener("DOMContentLoaded", function () {
  initJournalPage();
  initCatalogPage();

  const staticComments = document.getElementById("github-comments-container");
  if (staticComments) {
    const topic = staticComments.getAttribute("data-topic") || "general-discussion";
    mountGitHubComments(staticComments, topic);
  }
});