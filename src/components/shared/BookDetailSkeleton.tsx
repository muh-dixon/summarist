export default function BookDetailSkeleton() {
  return (
    <div className="book-detail book-detail--skeleton">
      <div className="book-detail__hero">
        <div className="book-detail__main">
          <div className="skeleton skeleton--line skeleton--eyebrow" />
          <div className="skeleton skeleton--line skeleton--title" />
          <div className="skeleton skeleton--line skeleton--subtitle" />
          <div className="skeleton skeleton--line skeleton--subtitle-short" />
        </div>
        <div className="skeleton skeleton--cover book-detail__cover-skeleton" />
      </div>

      <div className="book-detail__grid">
        <div className="skeleton skeleton--line skeleton--summary" />
        <div className="skeleton skeleton--line skeleton--summary" />
        <div className="skeleton skeleton--line skeleton--summary-short" />
      </div>
    </div>
  );
}
