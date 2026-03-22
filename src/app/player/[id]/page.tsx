"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  FiMinus,
  FiBookOpen,
  FiClock,
  FiHeadphones,
  FiPlus,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiRotateCw,
  FiType,
  FiVolume2,
} from "react-icons/fi";
import BackButton from "@/components/shared/BackButton";
import BookDetailSkeleton from "@/components/shared/BookDetailSkeleton";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { getBookById } from "@/lib/books";
import { upsertLibraryEntry as persistLibraryEntry } from "@/lib/userProfiles";
import { updateLibraryProgress } from "@/redux/features/librarySlice";
import {
  resetPlayer,
  setCurrentBook,
  setCurrentTime,
  setDuration,
  setIsPlaying,
  setPlaybackRate,
} from "@/redux/features/playerSlice";
import {
  selectCurrentUser,
  selectLibraryItems,
  selectPlayer,
} from "@/redux/selectors";
import type { Book } from "@/types/book";

const PLAYER_RATES = [0.75, 1, 1.25, 1.5, 2];
const SUMMARY_FONT_LEVELS = [15, 17, 19, 21] as const;

function formatTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "00:00";
  }

  const safeSeconds = Math.floor(totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function PlayerPage() {
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const libraryItems = useAppSelector(selectLibraryItems);
  const { currentBookId, currentTime, duration, isPlaying, playbackRate } =
    useAppSelector(selectPlayer);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef({ currentTime: 0, duration: 0 });
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryFontSizeIndex, setSummaryFontSizeIndex] = useState(1);
  const [volume, setVolume] = useState(0.85);

  useEffect(() => {
    let isCancelled = false;

    async function loadBook() {
      try {
        setIsLoading(true);
        const nextBook = await getBookById(params.id);

        if (!isCancelled) {
          setBook(nextBook);
          setError(null);
        }
      } catch (nextError) {
        const message =
          nextError instanceof Error
            ? nextError.message
            : "Unable to load this player right now.";

        if (!isCancelled) {
          setBook(null);
          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadBook();

    return () => {
      isCancelled = true;
    };
  }, [params.id]);

  useEffect(() => {
    if (!book || currentBookId === book.id) {
      return;
    }

    dispatch(setCurrentBook(book.id));
    dispatch(setIsPlaying(false));
    dispatch(setCurrentTime(0));
    dispatch(setDuration(0));
  }, [book, currentBookId, dispatch]);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    audioElement.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    audioElement.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    if (!book?.audioLink) {
      dispatch(setIsPlaying(false));
      return;
    }

    if (isPlaying) {
      void audioElement.play().catch(() => {
        dispatch(setIsPlaying(false));
      });
      return;
    }

    audioElement.pause();
  }, [book?.audioLink, dispatch, isPlaying]);

  useEffect(() => {
    progressRef.current = {
      currentTime,
      duration,
    };
  }, [currentTime, duration]);

  async function persistProgress(nextCurrentTime: number, nextDuration: number) {
    if (!currentUser || !book) {
      return;
    }

    const existingEntry = libraryItems.find((entry) => entry.book.id === book.id);
    const progressPercent =
      nextDuration > 0 ? Math.min((nextCurrentTime / nextDuration) * 100, 100) : 0;
    const isFinished = nextDuration > 0 && progressPercent >= 98;
    const finishedAt = isFinished
      ? existingEntry?.finishedAt ?? new Date().toISOString()
      : null;

    const entry = {
      book,
      savedAt: existingEntry?.savedAt ?? new Date().toISOString(),
      lastOpenedAt: new Date().toISOString(),
      currentTime: isFinished ? nextDuration : nextCurrentTime,
      duration: nextDuration,
      progressPercent: isFinished ? 100 : progressPercent,
      isFinished,
      finishedAt,
    };

    dispatch(
      updateLibraryProgress({
        book,
        currentTime: entry.currentTime,
        duration: entry.duration,
        progressPercent: entry.progressPercent,
        isFinished: entry.isFinished,
      }),
    );

    await persistLibraryEntry(currentUser.uid, entry);
  }

  useEffect(() => {
    return () => {
      void persistProgress(
        progressRef.current.currentTime,
        progressRef.current.duration,
      );
      dispatch(resetPlayer());
    };
  }, [book, currentUser, dispatch]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      void persistProgress(
        progressRef.current.currentTime,
        progressRef.current.duration,
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [book, currentUser]);

  const summarySections = useMemo(() => {
    if (!book?.summary) {
      return [];
    }

    return book.summary
      .split(/\n+/)
      .map((section) => section.trim())
      .filter(Boolean);
  }, [book?.summary]);

  const progressValue =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const summaryFontSize = SUMMARY_FONT_LEVELS[summaryFontSizeIndex];

  function handleTogglePlayback() {
    if (!book?.audioLink) {
      return;
    }

    if (isPlaying) {
      void persistProgress(progressRef.current.currentTime, progressRef.current.duration);
    }

    dispatch(setIsPlaying(!isPlaying));
  }

  function handleSeek(nextValue: number) {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    audioElement.currentTime = nextValue;
    dispatch(setCurrentTime(nextValue));
  }

  function handleSkip(seconds: number) {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    const nextTime = Math.min(
      Math.max(audioElement.currentTime + seconds, 0),
      duration || audioElement.duration || 0,
    );

    audioElement.currentTime = nextTime;
    dispatch(setCurrentTime(nextTime));
  }

  function handleSummarySizeChange(direction: "decrease" | "increase") {
    setSummaryFontSizeIndex((currentIndex) => {
      if (direction === "decrease") {
        return Math.max(currentIndex - 1, 0);
      }

      return Math.min(currentIndex + 1, SUMMARY_FONT_LEVELS.length - 1);
    });
  }

  if (isLoading) {
    return <BookDetailSkeleton />;
  }

  if (error || !book) {
    return (
      <div className="book-detail__error">
        {error ?? "Player unavailable."}
      </div>
    );
  }

  return (
    <div className="player-page">
      <BackButton className="player-page__back" />

      <section className="player-page__hero">
        <div className="player-page__cover-card">
          <img
            className="player-page__cover"
            src={book.imageLink}
            alt={`${book.title} cover`}
          />
        </div>

        <div className="player-page__main">
          <span className="player-page__eyebrow">Listening now</span>
          <h1 className="player-page__title">{book.title}</h1>
          <p className="player-page__author">by {book.author}</p>
          <p className="player-page__subtitle">{book.subTitle}</p>

          <div className="player-page__meta">
            <span className="player-page__meta-item">
              <FiHeadphones />
              {book.type}
            </span>
            <span className="player-page__meta-item">
              <FiClock />
              {book.duration || "Audio length unavailable"}
            </span>
            <span className="player-page__meta-item">
              <FiBookOpen />
              {book.keyIdeas} key ideas
            </span>
          </div>

          <div className="player-page__panel">
            <div className="player-page__progress-header">
              <span className="player-page__progress-label">Progress</span>
              <span className="player-page__progress-time">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <input
              className="player-page__seek"
              type="range"
              min={0}
              max={duration || 0}
              step={1}
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => handleSeek(Number(event.target.value))}
              disabled={!book.audioLink || duration <= 0}
              aria-label="Seek playback"
              style={
                {
                  "--player-progress": `${progressValue}%`,
                } as CSSProperties
              }
            />

            <div className="player-page__controls">
              <button
                className="player-page__skip"
                type="button"
                onClick={() => handleSkip(-10)}
                disabled={!book.audioLink}
                aria-label="Rewind 10 seconds"
              >
                <FiRotateCcw />
                10s
              </button>

              <button
                className="player-page__play"
                type="button"
                onClick={handleTogglePlayback}
                disabled={!book.audioLink}
                aria-label={isPlaying ? "Pause audio" : "Play audio"}
              >
                {isPlaying ? <FiPause /> : <FiPlay />}
              </button>

              <button
                className="player-page__skip"
                type="button"
                onClick={() => handleSkip(10)}
                disabled={!book.audioLink}
                aria-label="Skip forward 10 seconds"
              >
                <FiRotateCw />
                10s
              </button>
            </div>

            <div className="player-page__footer">
              <div className="player-page__control-group player-page__control-group--volume">
                <span className="player-page__control-label">
                  <FiVolume2 />
                  Volume
                </span>
                <div className="player-page__slider-wrap">
                  <input
                    className="player-page__mini-slider"
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(event) => setVolume(Number(event.target.value))}
                    disabled={!book.audioLink}
                    aria-label="Adjust volume"
                  />
                  <span className="player-page__slider-value">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>

              <div className="player-page__speed-controls">
                <span className="player-page__control-label player-page__control-label--center">
                  <FiHeadphones />
                  Playback speed
                </span>
                <div className="player-page__rate-group" aria-label="Playback speed">
                  {PLAYER_RATES.map((rate) => (
                    <button
                      className={`player-page__rate${
                        playbackRate === rate ? " player-page__rate--active" : ""
                      }`}
                      key={rate}
                      type="button"
                      onClick={() => dispatch(setPlaybackRate(rate))}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {!book.audioLink ? (
              <p className="player-page__notice">
                Audio isn&apos;t available for this title yet, but you can still
                read the full summary below.
              </p>
            ) : null}

            {book.audioLink ? (
              <audio
                key={book.id}
                ref={audioRef}
                preload="metadata"
                src={book.audioLink}
                onLoadedMetadata={(event) => {
                  dispatch(setDuration(event.currentTarget.duration || 0));
                }}
                onTimeUpdate={(event) => {
                  dispatch(setCurrentTime(event.currentTarget.currentTime));
                }}
                onEnded={(event) => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                  }
                  void persistProgress(
                    event.currentTarget.duration || progressRef.current.duration,
                    event.currentTarget.duration || progressRef.current.duration,
                  );
                  dispatch(setIsPlaying(false));
                  dispatch(setCurrentTime(0));
                }}
              />
            ) : null}
          </div>
        </div>
      </section>

      <section className="player-page__summary-card">
        <div className="player-page__summary-header">
          <div>
            <span className="player-page__eyebrow">Read along</span>
            <h2 className="player-page__summary-title">Summary</h2>
          </div>
          <div className="player-page__summary-tools">
            <div className="player-page__summary-text-control">
              <span className="player-page__control-label">
                <FiType />
                Summary text
              </span>
              <div className="player-page__text-controls">
                <button
                  className="player-page__text-step"
                  type="button"
                  onClick={() => handleSummarySizeChange("decrease")}
                  disabled={summaryFontSizeIndex === 0}
                  aria-label="Decrease summary text size"
                >
                  <FiMinus />
                </button>
                <span className="player-page__text-indicator">
                  {summaryFontSize}px
                </span>
                <button
                  className="player-page__text-step"
                  type="button"
                  onClick={() => handleSummarySizeChange("increase")}
                  disabled={summaryFontSizeIndex === SUMMARY_FONT_LEVELS.length - 1}
                  aria-label="Increase summary text size"
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            <span className="player-page__summary-badge">
              {summarySections.length || 1} sections
            </span>
          </div>
        </div>

        <div className="player-page__summary-body">
          {summarySections.length > 0 ? (
            summarySections.map((section, index) => (
              <p
                className={`player-page__summary-paragraph player-page__summary-paragraph--size-${summaryFontSize}`}
                key={`${book.id}-${index}`}
              >
                {section}
              </p>
            ))
          ) : (
            <p
              className={`player-page__summary-paragraph player-page__summary-paragraph--size-${summaryFontSize}`}
            >
              {book.summary}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
