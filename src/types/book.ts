export type BookStatus = "selected" | "recommended" | "suggested";

export type BookFormat = "audio" | "text" | "audio & text";

export interface Book {
  id: string;
  author: string;
  title: string;
  subTitle: string;
  imageLink: string;
  audioLink: string;
  totalRating: number;
  averageRating: number;
  keyIdeas: string;
  type: BookFormat;
  status: BookStatus;
  subscriptionRequired: boolean;
  summary: string;
  tags: string[];
  bookDescription: string;
  authorDescription: string;
  duration?: string;
}

export interface BookSearchResponse {
  books: Book[];
}
