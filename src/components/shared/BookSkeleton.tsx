type BookSkeletonProps = {
  count?: number;
};

export function SelectedBookSkeleton() {
  return (
    <div className="selected-book selected-book--skeleton">
      <div className="skeleton skeleton--line skeleton--eyebrow" />
      <div className="skeleton skeleton--line skeleton--title" />
      <div className="skeleton skeleton--line skeleton--subtitle" />
      <div className="skeleton skeleton--line skeleton--subtitle-short" />
      <div className="skeleton skeleton--line skeleton--summary" />
      <div className="skeleton skeleton--line skeleton--summary-short" />
    </div>
  );
}

export function BookCardSkeleton({ count = 4 }: BookSkeletonProps) {
  return Array.from({ length: count }).map((_, index) => (
    <div className="book-card book-card--skeleton" key={index}>
      <div className="skeleton skeleton--cover" />
      <div className="book-card__body">
        <div className="skeleton skeleton--line skeleton--author" />
        <div className="skeleton skeleton--line skeleton--book-title" />
        <div className="skeleton skeleton--line skeleton--book-subtitle" />
      </div>
    </div>
  ));
}
