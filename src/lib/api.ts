const API_BASE_URL =
  "https://us-central1-summaristt.cloudfunctions.net";

function isAbsoluteUrl(path: string) {
  return /^https?:\/\//.test(path);
}

type FetchJsonOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined | null>;
};

function buildUrl(
  path: string,
  query: FetchJsonOptions["query"] = {}
): string {
  const base =
    isAbsoluteUrl(path) || path.startsWith("/")
      ? "http://localhost"
      : `${API_BASE_URL}/`;
  const url = new URL(path, base);

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

export async function fetchJson<T>(
  path: string,
  options: FetchJsonOptions = {}
): Promise<T> {
  const { query, headers, ...init } = options;
  const requestUrl = buildUrl(path, query);
  const finalUrl =
    requestUrl.startsWith("http://localhost/") && path.startsWith("/")
      ? requestUrl.replace("http://localhost", "")
      : requestUrl;
  const response = await fetch(finalUrl, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export { API_BASE_URL };
