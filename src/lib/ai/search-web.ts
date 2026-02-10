export type WebSearchResult = {
  title: string;
  url: string;
  description: string;
};

export type WebContentResult = {
  title: string;
  url: string;
  content: string;
};

export const searchWeb = async ({
  query,
}: {
  query: string;
}): Promise<WebSearchResult[]> => {
  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey) {
    throw new Error("JINA_API_KEY is not set");
  }

  const response = await fetch(
    `https://s.jina.ai/?q=${encodeURIComponent(query)}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Respond-With": "no-content",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to search web: ${response.statusText}`);
  }

  const json = await response.json();
  const data = json.data as {
    title: string;
    url: string;
    description: string;
  }[];

  return data.map(({ title, url, description }) => ({
    title,
    url,
    description,
  }));
};

export const fetchWebContent = async ({
  url,
}: {
  url: string;
}): Promise<WebContentResult> => {
  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey) {
    throw new Error("JINA_API_KEY is not set");
  }

  const response = await fetch(`https://r.jina.ai/${url}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Engine": "browser",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch web content: ${response.statusText}`);
  }

  const json = await response.json();
  const data = json.data as {
    title: string;
    url: string;
    content: string;
  };

  return {
    title: data.title,
    url: data.url,
    content: data.content?.slice(0, 32000) ?? "",
  };
};
