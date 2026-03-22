"use client";

import { Children, type ReactNode, useMemo, useRef } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

type BookCarouselSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function BookCarouselSection({
  title,
  description,
  children,
}: BookCarouselSectionProps) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const getStep = () => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return 0;
    }

    const slide = scroller.querySelector<HTMLElement>(".book-section__slide");

    if (!slide) {
      return 0;
    }

    const styles = window.getComputedStyle(scroller);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");

    return slide.offsetWidth + gap;
  };

  const scrollCarousel = (direction: "left" | "right") => {
    const scroller = scrollerRef.current;

    if (!scroller || items.length <= 1) {
      return;
    }

    const step = getStep();

    if (!step) {
      return;
    }

    const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
    const isAtStart = scroller.scrollLeft <= step * 0.25;
    const isAtEnd = scroller.scrollLeft >= maxScrollLeft - step * 0.25;

    if (direction === "right" && isAtEnd) {
      scroller.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    if (direction === "left" && isAtStart) {
      scroller.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
      return;
    }

    scroller.scrollBy({
      left: direction === "right" ? step : -step,
      behavior: "smooth",
    });
  };

  return (
    <section className="book-section">
      <div className="book-section__header">
        <div>
          <h2 className="book-section__title">{title}</h2>
          <p className="book-section__description">{description}</p>
        </div>

        <div className="book-section__controls">
          <button
            className="book-section__control"
            type="button"
            onClick={() => scrollCarousel("left")}
            aria-label={`Scroll ${title} left`}
            disabled={items.length <= 1}
          >
            <FiArrowLeft />
          </button>
          <button
            className="book-section__control"
            type="button"
            onClick={() => scrollCarousel("right")}
            aria-label={`Scroll ${title} right`}
            disabled={items.length <= 1}
          >
            <FiArrowRight />
          </button>
        </div>
      </div>

      <div className="book-section__viewport">
        <div className="book-section__scroller" ref={scrollerRef}>
          {items.map((item, index) => (
            <div className="book-section__slide" key={`${title}-${index}`}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
