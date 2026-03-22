import Image from "next/image";
import LoginButton from "@/components/shared/LoginButton";

export default function Landing() {
  return (
    <section id="landing">
      <div className="container">
        <div className="row">
          <div className="landing__wrapper">
            <div className="landing__content">
              <div className="landing__content__title">
                Gain more knowledge <br className="remove--tablet" />
                in less time
              </div>
              <div className="landing__content__subtitle">
                Great summaries for busy people,
                <br className="remove--tablet" />
                individuals who barely have time to read,
                <br className="remove--tablet" />
                and even people who don&apos;t like to read.
              </div>
              <LoginButton className="btn home__cta--btn">Login</LoginButton>
            </div>
            <figure className="landing__image--mask">
              <Image
                src="/assets/landing.png"
                alt="landing"
                width={400}
                height={320}
                priority
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
