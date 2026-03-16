#!/usr/bin/env node
/**
 * Adds AUTH_SECRET to Vercel via API.
 * Requires: VERCEL_TOKEN (create at https://vercel.com/account/tokens)
 * Run: VERCEL_TOKEN=xxx node scripts/add-env-via-api.mjs
 */

import { execSync } from "child_process";

const token = process.env.VERCEL_TOKEN;
if (!token) {
  console.log(`
To add AUTH_SECRET automatically:

1. Create a token: https://vercel.com/account/tokens (scope: Full Account)
2. Run: VERCEL_TOKEN=your_token npm run add-auth-secret:api

Or run manually: npm run add-auth-secret
`);
  process.exit(1);
}

const AUTH_SECRET = execSync("openssl rand -base64 32", { encoding: "utf-8" }).trim();
const projectName = "orbarneaalacarte";

async function getProjectId() {
  const res = await fetch("https://api.vercel.com/v9/projects?limit=100", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const { projects } = await res.json();
  const project = projects?.find((p) => p.name === projectName);
  if (!project) throw new Error(`Project "${projectName}" not found`);
  return project.id;
}

async function addEnvVar(projectId) {
  const res = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key: "AUTH_SECRET",
      value: AUTH_SECRET,
      type: "encrypted",
      target: ["production", "preview", "development"],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to add env: ${res.status} ${err}`);
  }
}

async function triggerRedeploy(projectId) {
  const res = await fetch(`https://api.vercel.com/v13/deployments?projectId=${projectId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: projectName,
      project: projectId,
      target: "production",
    }),
  });
  if (!res.ok) {
    console.warn("Redeploy skipped (manual redeploy may be needed)");
    return;
  }
  console.log("Redeploy triggered.");
}

(async () => {
  try {
    console.log("Adding AUTH_SECRET to Vercel...");
    const projectId = await getProjectId();
    await addEnvVar(projectId);
    console.log("✓ AUTH_SECRET added.");
    await triggerRedeploy(projectId);
    console.log("Done!");
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
