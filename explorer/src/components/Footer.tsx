import "./Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faTelegram } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";

function Navbar() {

  return (
    <>
      <ul className="social-icon">
        <li className="social-icon__item">
          <Link className="social-icon__link" to={"https://discord.gg/Sq4EmYdBEk"}
                target={"_blank"}>
            <FontAwesomeIcon icon={faDiscord} />
          </Link>
        </li>

        <li className="social-icon__item">
          <Link className="social-icon__link" to={"https://t.me/+C94-EJOoVjVhM2U0"}
                target={"_blank"}>
            <FontAwesomeIcon icon={faTelegram} />
          </Link>
        </li>

        {/*
        <li className="social-icon__item">
          <Link className="social-icon__link" to={"#"}>
            <FontAwesomeIcon icon={faXTwitter} />
          </Link>
        </li>
        */}

        <li className="social-icon__item">
          <Link className="social-icon__link" to={"https://hey.xyz/u/verax"}
                target={"_blank"}>
            <FontAwesomeIcon icon={faLeaf} />
          </Link>
        </li>
      </ul>

      <ul className="menu">
        <li className="menu__item">
          <Link className={"menu__link"} to={"/"}>Homepage</Link>
        </li>
        <li className="menu__item">
          <Link className={"menu__link"} to={"https://docs.ver.ax"}
                target={"_blank"}>Documentation</Link>
        </li>
        <li className="menu__item">
          <Link className={"menu__link"} to={"https://community.ver.ax"}
                target={"_blank"}>Discourse</Link>
        </li>
      </ul>

      <div className={"bottom"}>
        <p>Made with ❤️ by Verax</p>
        <p>&copy;2023 Verax | All Rights Reserved</p>
      </div>
    </>
  );
}

export default Navbar;
