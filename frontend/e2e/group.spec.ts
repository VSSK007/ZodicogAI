import { expect, test, type Page } from "@playwright/test";
import { API, backendUp, fillPerson, hydrated } from "./helpers";

/** /analyze/group: 3-8 people, heat-map + web + summary (API answered with a synthetic result). */

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "*",
};

const NAMES = ["Alex", "Jordan", "Sam", "Riley", "Kai", "Mo", "Ada", "Lee"];

/** A plausible GroupResult for n people (scores 50-90, deterministic). */
function groupResult(n: number) {
  const matrix: (number | null)[][] = Array.from({ length: n }, () => Array<number | null>(n).fill(null));
  const pairs: { a: number; b: number; score: number }[] = [];
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const score = 50 + ((i * 7 + j * 13) % 41);
      matrix[i][j] = matrix[j][i] = score;
      pairs.push({ a: i, b: j, score });
    }
  const averages = matrix.map((row) => Math.round((row.reduce((s: number, v) => s + (v ?? 0), 0) / (n - 1)) * 10) / 10);
  const glue = averages.indexOf(Math.max(...averages));
  const strongest = pairs.reduce((m, p) => (p.score > m.score ? p : m));
  const spiciest = pairs.reduce((m, p) => (p.score < m.score ? p : m));
  const names = (p: { a: number; b: number }) => [NAMES[p.a], NAMES[p.b]];
  return {
    people: NAMES.slice(0, n).map((name, i) => ({ name, sign: "Pisces", mbti: i % 2 ? "ENFP" : "INTJ" })),
    matrix, pairs, averages,
    group_score: Math.round((pairs.reduce((s, p) => s + p.score, 0) / pairs.length) * 10) / 10,
    glue: { index: glue, name: NAMES[glue], average: averages[glue] },
    strongest: { ...strongest, names: names(strongest) },
    spiciest: { ...spiciest, names: names(spiciest) },
    analysis: {
      group_dynamic: "A **balanced** table with one clear anchor.",
      glue_note: "Holds the plans together.",
      strongest_pair_note: "They finish each other's sentences.",
      spiciest_pair_note: "Friction that keeps it interesting.",
      tip: "Plan one thing together this month.",
    },
  };
}

async function mockGroup(page: Page) {
  const bodies: { people: { name: string }[] }[] = [];
  await page.route(`${API}/analyze/group`, async (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const body = route.request().postDataJSON();
    bodies.push(body);
    await route.fulfill({ status: 200, contentType: "application/json", headers: CORS, body: JSON.stringify(groupResult(body.people.length)) });
  });
  return bodies;
}

async function fillAll(page: Page, n: number) {
  const mbtis = ["INTJ", "ENFP", "ISFJ", "ESTP", "INFP", "ENTJ", "ISTP", "ESFJ"];
  for (let i = 0; i < n; i++) {
    await fillPerson(page, i, { name: NAMES[i], day: String(3 + i * 3), month: String(1 + i), mbti: mbtis[i] });
  }
}

test("starts with three people; add up to eight, remove down to three", async ({ page }) => {
  await page.goto("/analyze/group");
  const rows = page.getByTestId("group-person");
  await expect(rows).toHaveCount(3);
  await expect(page.getByRole("button", { name: /Remove person/ })).toHaveCount(0); // at the minimum

  for (let i = 3; i < 8; i++) await page.getByRole("button", { name: "Add person" }).click();
  await expect(rows).toHaveCount(8);
  await expect(page.getByRole("button", { name: "Add person" })).toBeDisabled();
  await expect(page.getByText("8 of 8")).toBeVisible();

  await page.getByRole("button", { name: "Remove person 8" }).click();
  await expect(rows).toHaveCount(7);
  await expect(page.getByRole("button", { name: "Add person" })).toBeEnabled();
});

test("the first person is pre-filled from the saved profile", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("zodicog.profile", JSON.stringify({ name: "Alex", day: 15, month: 3, mbti: "INTJ", gender: "M" })),
  );
  await page.goto("/analyze/group");
  await expect(page.locator("input[placeholder='Name']").first()).toHaveValue("Alex");
  await expect(page.locator("input[placeholder='Name']").nth(1)).toHaveValue("");
});

test("incomplete people are caught before any request", async ({ page }) => {
  const bodies = await mockGroup(page);
  await page.goto("/analyze/group");
  await page.getByRole("button", { name: "Read the group" }).click();
  await expect(page.locator("div[role=alert]").filter({ hasText: "Person 1" })).toBeVisible();
  expect(bodies).toHaveLength(0);
});

for (const n of [3, 8]) {
  test(`${n} people: heat-map, web and summary`, async ({ page }) => {
    const bodies = await mockGroup(page);
    await page.goto("/analyze/group");
    for (let i = 3; i < n; i++) await page.getByRole("button", { name: "Add person" }).click();
    await fillAll(page, n);
    await page.getByRole("button", { name: "Read the group" }).click();

    // The request carries everyone, once.
    await expect(page.getByTestId("group-heatmap")).toBeVisible({ timeout: 20_000 });
    expect(bodies).toHaveLength(1);
    expect(bodies[0].people.map((p) => p.name)).toEqual(NAMES.slice(0, n));

    // n x n grid of cells, n(n-1)/2 lines in the web.
    await expect(page.getByTestId("group-heatmap").locator('[role="cell"]')).toHaveCount(n * n);
    await expect(page.getByTestId("group-web").locator("line")).toHaveCount((n * (n - 1)) / 2);

    const r = groupResult(n);
    await expect(page.getByTestId("group-glue")).toContainText(r.glue.name);
    await expect(page.getByTestId("group-strongest")).toContainText(r.strongest.names.join(" + "));
    await expect(page.getByTestId("group-spiciest")).toContainText(r.spiciest.names.join(" + "));
    await expect(page.getByText("A balanced table with one clear anchor.")).toBeVisible(); // markdown rendered
  });
}

test("a server-side validation message is shown with a retry", async ({ page }) => {
  await page.route(`${API}/analyze/group`, (route) =>
    route.request().method() === "OPTIONS"
      ? route.fulfill({ status: 204, headers: CORS })
      : route.fulfill({ status: 400, headers: CORS, contentType: "application/json", body: '{"detail":"Add between 3 and 8 people."}' }),
  );
  await page.goto("/analyze/group");
  await fillAll(page, 3);
  await page.getByRole("button", { name: "Read the group" }).click();
  await expect(page.locator("div[role=alert]").filter({ hasText: "between 3 and 8" })).toBeVisible();
});

test("the page is reachable from the palette", async ({ page }) => {
  await hydrated(page, "/about");
  await page.keyboard.press("Control+k");
  const palette = page.getByRole("dialog", { name: "Search" });
  await expect(palette.getByRole("combobox")).toBeFocused();
  await page.keyboard.type("group");
  await expect(palette.getByRole("option", { name: /Group Chemistry/ })).toBeVisible();
});

test.describe("saved group readings", () => {
  test.beforeAll(async () => {
    test.skip(!(await backendUp()), `no backend answering ${API}/health`);
  });

  test("render the heat-map and web at /r/<id>", async ({ page, request }) => {
    const saved = await request.post(`${API}/results`, {
      data: { analysis_type: "group_analysis", title: "Alex, Jordan, Sam · Group Chemistry", payload: groupResult(4) },
    });
    const { id } = await saved.json();
    await page.goto(`/r/${id}`);
    await expect(page.getByTestId("group-heatmap")).toBeVisible();
    await expect(page.getByTestId("group-web").locator("line")).toHaveCount(6);
    await expect(page.getByTestId("group-glue")).toBeVisible();
  });
});

test("the heat-map columns line up with the row labels", async ({ page }) => {
  await mockGroup(page);
  await page.goto("/analyze/group");
  await page.getByRole("button", { name: "Add person" }).click(); // starts with three
  await fillAll(page, 4);
  await page.getByRole("button", { name: "Read the group" }).click();
  const map = page.getByTestId("group-heatmap");
  await expect(map).toBeVisible({ timeout: 20_000 });

  // Each row header sits to the LEFT of its cells, and each column header is centred over its column.
  const rowHeaders = await map.locator('[role="rowheader"]').all();
  const firstRowCells = await map.locator('[role="row"]').nth(1).locator('[role="cell"]').all();
  const colHeaders = await map.locator('[role="columnheader"]').all();
  const rh = (await rowHeaders[0].boundingBox())!;
  const c0 = (await firstRowCells[0].boundingBox())!;
  expect(rh.x + rh.width).toBeLessThanOrEqual(c0.x + 1);

  expect(colHeaders).toHaveLength(5); // the empty corner + 4 names
  for (let j = 0; j < 4; j++) {
    const header = (await colHeaders[j + 1].boundingBox())!;
    const cell = (await firstRowCells[j].boundingBox())!;
    expect(Math.abs(header.x + header.width / 2 - (cell.x + cell.width / 2))).toBeLessThan(3);
  }
});
