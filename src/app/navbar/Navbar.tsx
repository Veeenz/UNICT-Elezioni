import React, { FunctionComponent } from 'react';
import './Navbar.scss';
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from 'react-router-dom';

const Navbar: FunctionComponent = () => {
  return (
    <div className="Navbar">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <a className="navbar-brand" href="#">UNICT-Elezioni</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarColor01">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/home">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/page">Other Page</Link>
            </li>
          </ul>
          <div className="navbar-nav mr-auto"></div>
          <FontAwesomeIcon icon={faGithub} />
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
