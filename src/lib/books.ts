import { fetchJson } from "@/lib/api";
import type { Book, BookStatus } from "@/types/book";

const mockBooks: Book[] = [
  {
    id: "1",
    author: "Test Author",
    title: "Test Book 1",
    subTitle: "A test book",
    imageLink: "/assets/pricing-top.png",
    audioLink: "",
    totalRating: 100,
    averageRating: 4.5,
    keyIdeas: "12",
    type: "text",
    status: "selected",
    subscriptionRequired: false,
    summary: "This is a test summary.",
    tags: ["test", "book"],
    bookDescription: "A test book description.",
    authorDescription: "A test author description.",
  },
  {
    id: "2",
    author: "Another Author",
    title: "Recommended Book",
    subTitle: "Highly recommended",
    imageLink: "/assets/login.png",
    audioLink: "",
    totalRating: 200,
    averageRating: 4.8,
    keyIdeas: "15",
    type: "audio & text",
    status: "recommended",
    subscriptionRequired: true,
    summary: "Another test summary.",
    tags: ["recommended", "audio"],
    bookDescription: "Recommended book description.",
    authorDescription: "Recommended author description.",
  },
  {
    id: "3",
    author: "Suggested Author",
    title: "Suggested Book",
    subTitle: "You might like this",
    imageLink: "/assets/landing.png",
    audioLink: "",
    totalRating: 150,
    averageRating: 4.2,
    keyIdeas: "10",
    type: "text",
    status: "suggested",
    subscriptionRequired: false,
    summary: "Suggested summary.",
    tags: ["suggested"],
    bookDescription: "Suggested book description.",
    authorDescription: "Suggested author description.",
  },
];

function getMockBookById(id: string) {
  return mockBooks.find((book) => book.id === id) ?? null;
}

function getMockBooksByStatus(status: BookStatus) {
  const matches = mockBooks.filter((book) => book.status === status);

  return status === "selected" ? (matches[0] ?? null) : matches;
}

export async function getBooksByStatus(status: BookStatus) {
  try {
    return await fetchJson<Book[] | Book>("/api/books", {
      query: { status },
    });
  } catch {
    return getMockBooksByStatus(status);
  }
}

export async function getSelectedBook() {
  const response = await getBooksByStatus("selected");
  return Array.isArray(response) ? response[0] ?? null : response;
}

export async function getRecommendedBooks() {
  const response = await getBooksByStatus("recommended");
  return Array.isArray(response) ? response : [];
}

export async function getSuggestedBooks() {
  const response = await getBooksByStatus("suggested");
  return Array.isArray(response) ? response : [];
}

export async function getBookById(id: string) {
  try {
    return await fetchJson<Book>("/api/book", {
      query: { id },
    });
  } catch {
    const mockBook = getMockBookById(id);

    if (mockBook) {
      return mockBook;
    }

    throw new Error("Unable to load this book right now.");
  }
}

export async function searchBooks(search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return [];
  }

  const mockMatches = mockBooks.filter((book) => {
    return (
      book.title.toLowerCase().includes(normalizedSearch) ||
      book.author.toLowerCase().includes(normalizedSearch)
    );
  });

  if (mockMatches.length > 0) {
    return mockMatches;
  }

  try {
    return await fetchJson<Book[]>("/api/books", {
      query: { search },
    });
  } catch {
    return [];
  }
}
