const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const ANILIST_URL = 'https://graphql.anilist.co';

export interface CharacterSearchResult {
  mal_id: number;
  name: string;
  images: { jpg: { image_url: string } };
}

export interface AnimeSearchResult {
  mal_id: number;
  title: string;
  type: string;
  status: string;
  images: { jpg: { small_image_url: string } };
}

export interface CharacterDetailsResult {
  image: string;
  name: string;
}

const requestJson = async <T>(url: string, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(url, {
    ...(signal ? { signal } : {}),
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  return response.json() as Promise<T>;
};

const requestAniList = async <T>(query: string, variables: Record<string, unknown>, signal?: AbortSignal) => {
  const response = await fetch(ANILIST_URL, {
    method: 'POST',
    ...(signal ? { signal } : {}),
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error(`AniList request failed with status ${response.status}`);
  const payload = await response.json() as { data?: T; errors?: unknown[] };
  if (!payload.data || payload.errors?.length) throw new Error('AniList returned an invalid response');
  return payload.data;
};

export const searchCharacters = async (search: string, signal?: AbortSignal): Promise<CharacterSearchResult[]> => {
  const params = new URLSearchParams({ q: search, limit: '5' });
  try {
    const payload = await requestJson<{ data?: CharacterSearchResult[] }>(`${JIKAN_BASE_URL}/characters?${params}`, signal);
    return payload.data ?? [];
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    const query = `query ($search: String!) {
      Page(page: 1, perPage: 5) {
        characters(search: $search, sort: FAVOURITES_DESC) { id name { full } image { large } }
      }
    }`;
    const data = await requestAniList<{
      Page: { characters: Array<{ id: number; name: { full: string }; image: { large: string } }> };
    }>(query, { search }, signal);
    return data.Page.characters.map((character) => ({
      mal_id: character.id,
      name: character.name.full,
      images: { jpg: { image_url: character.image.large } },
    }));
  }
};

export const getCharacter = async (
  id: string | number | null | undefined,
  name: string,
  signal?: AbortSignal,
): Promise<CharacterDetailsResult | null> => {
  try {
    const endpoint = id
      ? `${JIKAN_BASE_URL}/characters/${id}`
      : `${JIKAN_BASE_URL}/characters?${new URLSearchParams({ q: name, limit: '1' })}`;
    const payload = await requestJson<{ data?: CharacterSearchResult | CharacterSearchResult[] }>(endpoint, signal);
    const character = Array.isArray(payload.data) ? payload.data[0] : payload.data;
    return character ? { image: character.images.jpg.image_url, name: character.name } : null;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    const results = await searchCharacters(name, signal);
    const character = results[0];
    return character ? { image: character.images.jpg.image_url, name: character.name } : null;
  }
};

export const searchAnime = async (search: string, signal?: AbortSignal): Promise<AnimeSearchResult[]> => {
  const params = new URLSearchParams({ q: search, limit: '6' });
  try {
    const payload = await requestJson<{ data?: AnimeSearchResult[] }>(`${JIKAN_BASE_URL}/anime?${params}`, signal);
    return payload.data ?? [];
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    const query = `query ($search: String!) {
      Page(page: 1, perPage: 6) {
        media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
          idMal title { romaji english } format status coverImage { medium }
        }
      }
    }`;
    const data = await requestAniList<{
      Page: { media: Array<{
        idMal: number | null;
        title: { romaji: string; english: string | null };
        format: string | null;
        status: string | null;
        coverImage: { medium: string };
      }> };
    }>(query, { search }, signal);
    return data.Page.media.map((anime, index) => ({
      mal_id: anime.idMal ?? -index - 1,
      title: anime.title.english || anime.title.romaji,
      type: anime.format?.replaceAll('_', ' ') ?? 'Anime',
      status: anime.status?.replaceAll('_', ' ') ?? '',
      images: { jpg: { small_image_url: anime.coverImage.medium } },
    }));
  }
};
