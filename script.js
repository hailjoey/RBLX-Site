const devForumEndpoint = 'https://devforum.roblox.com/latest.json';

const updates = [
  {
    title: 'Developer Forum: New experience IDs rollout',
    summary: 'Roblox staff announced the gradual rollout of new experience IDs to improve analytics and reporting for creators.',
    time: '2 hours ago',
    tag: 'Dev Forum',
    url: 'https://devforum.roblox.com',
  },
  {
    title: 'Mobile performance patch available',
    summary: 'A hotfix now reduces memory usage for Roblox mobile sessions and improves load times for crowded games.',
    time: 'Today',
    tag: 'Performance',
    url: 'https://devforum.roblox.com',
  },
  {
    title: 'Roblox economy update teased',
    summary: 'Community discussion centers on new Robux tax features and payout transparency scheduled for summer.',
    time: 'Yesterday',
    tag: 'Economy',
    url: 'https://devforum.roblox.com',
  },
];

const opinions = [
  { text: 'Players are excited for better avatar customizations, especially animation controls.', sentiment: 'positive' },
  { text: 'Many creators want a simpler way to track DevEx fees and tax estimates.', sentiment: 'neutral' },
  { text: 'Some users request fewer ads in Roblox Studio and more tools for community events.', sentiment: 'positive' },
  { text: 'A small group is concerned about monetization changes hurting indie games.', sentiment: 'negative' },
];

const topics = ['Animation Editor', 'Robux Tax Rules', 'Live Events', 'Mobile Quality', 'Avatar Accessory', 'Experience Metrics'];

const games = [
  {
    title: 'Pixel City Adventures',
    description: 'Fast-growing open-world RPG with weekly quests and team-based missions.',
    players: '132K',
    growth: '+14%',
    tag: 'Recommended',
  },
  {
    title: 'Skybound Racing',
    description: 'Competitive flying races with custom hoverboards and daily leaderboards.',
    players: '98K',
    growth: '+9%',
    tag: 'Hot',
  },
  {
    title: 'Mystic Tower Defense',
    description: 'Co-op strategy defense with evolving waves and developer rewards.',
    players: '86K',
    growth: '+22%',
    tag: 'Trending',
  },
  {
    title: 'Neon City Life',
    description: 'Social hangout with mini-games, roleplay, and creator-led events.',
    players: '75K',
    growth: '+12%',
    tag: 'Community',
  },
];

function renderUpdates() {
  const container = document.getElementById('updateCards');
  container.innerHTML = updates
    .map(
      (update) => `
      <article class="update-card">
        <span class="badge">${update.tag}</span>
        <h3>${update.title}</h3>
        <p>${update.summary}</p>
        <p class="meta">${update.time}</p>
        <a href="${update.url || 'https://devforum.roblox.com'}" target="_blank" rel="noreferrer">View thread</a>
      </article>
    `,
    )
    .join('');
}

function decodeHtmlEntities(text) {
  const parser = new DOMParser();
  const decoded = parser.parseFromString(text, 'text/html');
  return decoded.documentElement.textContent || text;
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function truncateText(text, maxLength = 140) {
  const trimmed = text.trim();
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength).trim()}…` : trimmed;
}

async function fetchDevForumUpdates() {
  const status = document.getElementById('updateStatus');
  try {
    const response = await fetch(devForumEndpoint);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const topics = data.topic_list?.topics || [];
    if (!topics.length) {
      throw new Error('No topics returned from Dev Forum.');
    }
    const liveUpdates = topics.slice(0, 6).map((topic) => ({
      title: decodeHtmlEntities(topic.fancy_title || topic.title),
      summary: truncateText(decodeHtmlEntities(topic.excerpt || 'No preview available.')),
      time: timeAgo(new Date(topic.last_posted_at)),
      tag: topic.tags?.[0] || 'Dev Forum',
      url: `https://devforum.roblox.com/t/${topic.slug}/${topic.id}`,
    }));
    updates.splice(0, updates.length, ...liveUpdates);
    renderUpdates();
    status.textContent = `Live Roblox Dev Forum feed — updated ${new Date().toLocaleTimeString()}`;
  } catch (error) {
    console.error('Dev Forum integration failed', error);
    status.textContent = 'Live Dev Forum load failed — showing local fallback updates.';
  }
}

function renderCommunity() {
  const opinionList = document.getElementById('opinionList');
  const positiveCount = opinions.filter((item) => item.sentiment === 'positive').length;
  const neutralCount = opinions.filter((item) => item.sentiment === 'neutral').length;
  const negativeCount = opinions.filter((item) => item.sentiment === 'negative').length;
  const total = opinions.length;
  document.getElementById('positivePct').textContent = `${Math.round((positiveCount / total) * 100)}%`;
  document.getElementById('neutralPct').textContent = `${Math.round((neutralCount / total) * 100)}%`;
  document.getElementById('negativePct').textContent = `${Math.round((negativeCount / total) * 100)}%`;
  opinionList.innerHTML = opinions
    .map(
      (opinion) => `
      <li>
        <strong>${opinion.sentiment.toUpperCase()}</strong>
        <p>${opinion.text}</p>
      </li>
    `,
    )
    .join('');

  const topicChips = document.getElementById('topicChips');
  topicChips.innerHTML = topics.map((topic) => `<span class="topic-chip">${topic}</span>`).join('');
}

function renderGames() {
  const grid = document.getElementById('gamesGrid');
  grid.innerHTML = games
    .map(
      (game) => `
      <article class="game-card">
        <div class="game-card-content">
          <span class="badge">${game.tag}</span>
          <h3>${game.title}</h3>
          <p>${game.description}</p>
          <div class="game-meta">
            <span>Players: ${game.players}</span>
            <span>Growth: ${game.growth}</span>
          </div>
        </div>
      </article>
    `,
    )
    .join('');

  const updatedAt = new Date();
  const formatted = updatedAt.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  document.getElementById('gamesUpdatedAt').textContent = `Updated ${formatted}`;
}

function calculateTax() {
  const amount = Number(document.getElementById('robuxAmount').value) || 0;
  const rate = Number(document.getElementById('taxRate').value) || 0;
  const taxAmount = Math.round((amount * rate) / 100);
  const netAmount = amount - taxAmount;
  const usdValue = (netAmount * 0.0035).toFixed(2);
  document.getElementById('taxAmount').textContent = `${taxAmount.toLocaleString()} Robux`;
  document.getElementById('netRobux').textContent = `${netAmount.toLocaleString()} Robux`;
  document.getElementById('usdValue').textContent = `$${Number(usdValue).toLocaleString()}`;
}

function bindEvents() {
  document.getElementById('calculateBtn').addEventListener('click', calculateTax);
  document.getElementById('voteBtn').addEventListener('click', () => {
    const select = document.getElementById('communityChoice');
    document.getElementById('surveyResult').textContent = `Thanks! You voted for ${select.options[select.selectedIndex].text}.`;
  });
}

function init() {
  renderUpdates();
  renderCommunity();
  renderGames();
  calculateTax();
  bindEvents();
  fetchDevForumUpdates();
}

init();
