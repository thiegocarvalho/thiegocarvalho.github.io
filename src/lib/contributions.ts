/**
 * The GitHub contribution calendar, fetched once at build time from the
 * GraphQL API. Needs a token in GITHUB_TOKEN (the Actions token in CI;
 * locally `GITHUB_TOKEN=$(gh auth token) pnpm build`). Without one, or if the
 * API fails, it resolves to null and the home page simply leaves the graph out:
 * the site never fails to build over it.
 */
export const GITHUB_LOGIN = 'thiegocarvalho';

export interface ContributionDay {
  date: string;
  count: number;
  /** 0 (none) to 4 (most), GitHub's own quartiles. */
  level: 0 | 1 | 2 | 3 | 4;
}
export interface Contributions {
  total: number;
  /** Contributions to private repositories, counted but not detailed. */
  private: number;
  /** Week columns, oldest first; each holds up to seven days, Sunday first. */
  weeks: ContributionDay[][];
}

const LEVELS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 } as const;
const QUERY = `query($login: String!) { user(login: $login) { contributionsCollection {
  restrictedContributionsCount
  contributionCalendar { totalContributions weeks { contributionDays { date contributionCount contributionLevel } } }
} } }`;

async function load(): Promise<Contributions | null> {
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (!token) {
    console.warn('[contributions] no GITHUB_TOKEN; leaving the graph out');
    return null;
  }
  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { authorization: `bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { login: GITHUB_LOGIN } }),
    });
    const json = await res.json();
    const c = json?.data?.user?.contributionsCollection;
    if (!res.ok || !c) throw new Error(`HTTP ${res.status} ${JSON.stringify(json?.errors ?? '')}`);
    return {
      total: c.contributionCalendar.totalContributions,
      private: c.restrictedContributionsCount,
      weeks: c.contributionCalendar.weeks.map((w: { contributionDays: any[] }) =>
        w.contributionDays.map((d) => ({
          date: d.date,
          count: d.contributionCount,
          level: LEVELS[d.contributionLevel as keyof typeof LEVELS] ?? 0,
        })),
      ),
    };
  } catch (e) {
    console.warn(`[contributions] fetch failed; leaving the graph out: ${e}`);
    return null;
  }
}

// Both locale home pages render it; one request serves the whole build.
let cached: Promise<Contributions | null> | undefined;
export const getContributions = () => (cached ??= load());
