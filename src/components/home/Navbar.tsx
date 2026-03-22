import Image from "next/image";
import LoginButton from "@/components/shared/LoginButton";

export default function Navbar() {
  return (
    <nav className="nav">
      <div className="nav__wrapper">
        <figure className="nav__img--mask">
          <Image
            className="nav__img"
            src="/assets/logo.png"
            alt="logo"
            width={200}
            height={48}
            priority
          />
        </figure>
        <ul className="nav__list--wrapper">
          <li>
            <LoginButton className="nav__list nav__list--login">
              Login
            </LoginButton>
          </li>
          <li className="nav__list nav__list--mobile">About</li>
          <li className="nav__list nav__list--mobile">Contact</li>
          <li className="nav__list nav__list--mobile">Help</li>
        </ul>
      </div>
    </nav>
  );
}
