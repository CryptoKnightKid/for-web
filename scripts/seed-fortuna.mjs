const API_URL =
  process.env.FORTUNA_API_URL ?? "https://api-production-4662.up.railway.app";
const EVENTS_URL =
  process.env.FORTUNA_EVENTS_URL ?? "wss://events-production-4fc9.up.railway.app";
const EMAIL = process.env.FORTUNA_SEED_EMAIL;
const PASSWORD = process.env.FORTUNA_SEED_PASSWORD;
const TOKEN = process.env.FORTUNA_SEED_TOKEN;

const categories = [
  {
    title: "FORTUNA ONE HUB",
    channels: [
      ["announcements", "Text"],
      ["how-fortuna-works", "Text"],
      ["start-here", "Text"],
      ["say-hello", "Text"],
    ],
  },
  {
    title: "THE NETWORK",
    channels: [
      ["ask-the-network", "Text"],
      ["introductions", "Text"],
      ["general-chat", "Text"],
      ["opportunities", "Text"],
    ],
  },
  {
    title: "SPEAKER ACCESS",
    channels: [
      ["ama-schedule", "Text"],
      ["frameworks-vault", "Text"],
      ["catchup-corner", "Text"],
      ["speaker-questions", "Text"],
    ],
  },
  {
    title: "THE CAMPUSES",
    channels: [
      ["mindset-performance", "Text"],
      ["business-growth", "Text"],
      ["wealth-investing", "Text"],
      ["networking-relationships", "Text"],
      ["the-vault", "Text"],
    ],
  },
  {
    title: "THE ROAD TO FORTUNA",
    channels: [
      ["countdown-hub", "Text"],
      ["speaker-amas", "Text"],
      ["live-sessions", "Voice"],
      ["event-prep", "Text"],
    ],
  },
  {
    title: "CONNECT",
    channels: [
      ["brisbane", "Text"],
      ["gold-coast", "Text"],
      ["melbourne", "Text"],
      ["sydney", "Text"],
      ["newcastle", "Text"],
    ],
  },
  {
    title: "RESOURCES",
    channels: [
      ["templates-tools", "Text"],
      ["reading-list", "Text"],
      ["fortuna-perks", "Text"],
      ["join-limitlessx", "Text"],
    ],
  },
  {
    title: "VIP SPACE",
    channels: [
      ["vip-lounge", "Text"],
      ["diamond-club", "Text"],
      ["inner-circle", "Text"],
      ["meet-tony", "Text"],
    ],
  },
  {
    title: "PODS",
    channels: [
      ["pod-matching", "Text"],
      ["pod-schedules", "Text"],
      ["pod-wins", "Text"],
    ],
  },
  {
    title: "CONTENT LIBRARY",
    channels: [
      ["replays", "Text"],
      ["resources", "Text"],
      ["member-notes", "Text"],
    ],
  },
];

const roles = [
  ["Garnet", "#8f1f24"],
  ["Ruby", "#c52743"],
  ["VIP", "#c8a45d"],
  ["Diamond", "#cbd6e2"],
  ["Inner Circle", "#b68a54"],
  ["Meet Tony", "#efe2c0"],
  ["Moderator", "#7e8fff"],
  ["Concierge", "#28b48f"],
];

async function api(path, options = {}) {
  const response = await request(path, options);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${options.method ?? "GET"} ${path} failed: ${response.status} ${text}`);
  }

  if (response.status === 204) return undefined;
  return response.json();
}

async function request(path, options, attempt = 0) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      "x-session-token": await getToken(),
      ...(options.headers ?? {}),
    },
  });

  if (response.status !== 429 || attempt > 5) return response;

  const payload = await response
    .clone()
    .json()
    .catch(() => ({ retry_after: 5000 }));
  const delay = Number(payload.retry_after ?? 5000) + 500;
  console.log(`Rate limited on ${options.method ?? "GET"} ${path}; waiting ${delay}ms`);
  await new Promise((resolve) => setTimeout(resolve, delay));
  return request(path, options, attempt + 1);
}

let sessionToken;
async function getToken() {
  if (sessionToken) return sessionToken;
  if (TOKEN) {
    sessionToken = TOKEN;
    return sessionToken;
  }

  if (!EMAIL || !PASSWORD) {
    throw new Error(
      "Set FORTUNA_SEED_TOKEN or FORTUNA_SEED_EMAIL and FORTUNA_SEED_PASSWORD.",
    );
  }

  const response = await fetch(`${API_URL}/auth/session/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
      friendly_name: "Fortuna One Seeder",
    }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status} ${await response.text()}`);
  }

  sessionToken = (await response.json()).token;
  return sessionToken;
}

async function readySnapshot() {
  const token = await getToken();
  const url = new URL(EVENTS_URL);
  url.searchParams.set("version", "1");
  url.searchParams.set("format", "json");
  url.searchParams.set("token", token);

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error("Timed out waiting for Events Ready payload."));
    }, 15000);

    ws.onerror = () => {
      clearTimeout(timer);
      reject(new Error("Could not connect to Events."));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "Ready") {
        clearTimeout(timer);
        ws.close();
        resolve(message);
      }
    };
  });
}

async function ensureServer(snapshot) {
  const existing = snapshot.servers?.find((server) => server.name === "Fortuna One");
  if (existing) return existing;

  const created = await api("/servers/create", {
    method: "POST",
    body: JSON.stringify({ name: "Fortuna One" }),
  });

  return created.server;
}

async function ensureChannel(server, channelByName, name, type) {
  if (channelByName.has(name)) return channelByName.get(name);

  const channel = await api(`/servers/${server._id}/channels`, {
    method: "POST",
    body: JSON.stringify({ name, type }),
  });

  channelByName.set(channel.name, channel);
  return channel;
}

async function ensureRoles(server) {
  const existingRoles = new Map(
    Object.entries(server.roles ?? {}).map(([id, role]) => [role.name, { id, ...role }]),
  );

  for (const [name, colour] of roles) {
    let role = existingRoles.get(name);
    if (!role) {
      const created = await api(`/servers/${server._id}/roles`, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      role = { id: created.id, name };
    }

    await api(`/servers/${server._id}/roles/${role.id}`, {
      method: "PATCH",
      body: JSON.stringify({ colour, hoist: true }),
    });
  }
}

async function seed() {
  const snapshot = await readySnapshot();
  let server = await ensureServer(snapshot);
  let channels = snapshot.channels?.filter((channel) => channel.server === server._id) ?? [];
  const channelByName = new Map(channels.map((channel) => [channel.name, channel]));

  const categoryPayload = [];
  for (const category of categories) {
    const ids = [];
    for (const [name, type] of category.channels) {
      const channel = await ensureChannel(server, channelByName, name, type);
      ids.push(channel._id);
    }
    categoryPayload.push({
      id: category.title.toLowerCase().replaceAll(" ", "-"),
      title: category.title,
      channels: ids,
    });
  }

  await ensureRoles(server);

  await api(`/servers/${server._id}`, {
    method: "PATCH",
    body: JSON.stringify({
      description:
        "The private Fortuna One room for members, campuses, speaker access, live sessions, pods, resources, and the LimitlessX pathway.",
      categories: categoryPayload,
    }),
  });

  const startHere = channelByName.get("start-here");
  if (startHere) {
    await api(`/channels/${startHere._id}/messages`, {
      method: "POST",
      body: JSON.stringify({
        content:
          "Welcome to Fortuna One. Start with your profile, introduce yourself, join your city room, make specific asks, offer value, and use the live sessions/resources to stay close to the room.",
      }),
    }).catch(() => undefined);
  }

  console.log(`Seeded Fortuna One server: ${server._id}`);
  console.log(`Categories: ${categoryPayload.length}`);
  console.log(`Channels: ${[...channelByName.keys()].length}`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
