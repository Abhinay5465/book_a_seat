import React, { useRef, useState, useEffect } from 'react';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Login from './Login';
import Button from 'react-bootstrap/Button';
import axios from '../../api/axios';
import styled from 'styled-components';

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.[a-z])(?=.[A-Z])(?=.[0-9])(?=.[!@#$%]).{8,24}$/;

const MainContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(to bottom, #D1A272, white);
`;

const ElementStyle = styled.div`
  margin-top: 2rem;
  text-align: left;

  section {
    width: 500px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 1rem;
    border: 1px solid rgba(0, 0, 0, 0.4);
    background-image: url('https://api.daburinternational.com/wp-content/uploads/2024/01/fallback-image-square-800x800-1.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    backdrop-filter: blur(5px);
    background-color: rgba(255, 255, 255, 0.7);
  }

  .background-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('https://api.daburinternational.com/wp-content/uploads/2024/01/fallback-image-square-800x800-1.jpg');
    background-size: cover;
    background-position: center;
    opacity: 0.9;
    z-index: 0.9;
  }

  form {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    flex-grow: 1;
    padding-bottom: 1rem;

    label, button {
      margin-top: 0.6rem;
    }
  }

  .form-group {
    margin-top: 0.6rem;
  }

  .valid {
    color: green;
    margin-left: 0.5rem;
  }

  .invalid {
    color: red;
    margin-left: 0.5rem;
  }

  .errmsg {
    background-color: lightpink;
    color: red;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .offscreen {
    display: none;
  }

  .line {
    display: inline-block;
    margin-top: 1rem;
  }
`;

const NavbarStyle = styled.div`
  .navbar {
    width: 1400px;
    margin-bottom: 1rem;
    background: linear-gradient(bottom to top, #D1A272, white);
  }

  .navbar-nav {
    margin-left: auto;
  }

  .nav-link {
    margin-right: 1rem;
  }
`;

const Navbar = () => {
  return (
    <NavbarStyle>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <a href="https://www.dabur.com/" target="_blank" rel="noopener noreferrer">
            <img src="https://img.etimg.com/thumb/width-1600,height-900,imgsize-34944,resizemode-75,msid-105238348/industry/cons-products/fmcg/140-year-old-dabur-family-hits-trouble-as-it-reinvents-its-business.jpg" alt="Dabur Logo" width="120" height="80" className="d-inline-block align-top" />
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link" href="/login">Login</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </NavbarStyle>
  );
};

const Register = () => {
  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState('');
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [pwd, setPwd] = useState('');
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState('');
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setValidName(USER_REGEX.test(user));
  }, [user]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg('');
  }, [user, pwd, matchPwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validName || !validPwd || !validMatch) {
      setErrMsg('Invalid entry');
      return;
    }

    try {
      const response = await axios.post('/api/register', { user, pwd });

      console.log(response.data);
      setSuccess(true); // Show success message

    } catch (error) {
      if (!error?.response) {
        setErrMsg('No Server Response');
      } else if (error.response?.status === 409) {
        setErrMsg('Username Taken');
      } else {
        setErrMsg('Registration Failed');
      }
      errRef.current.focus();
    }
  };
  return (
    <ElementStyle>
      {success ? (
        <Login />
      ) : (
        <section>
          <p ref={errRef} className={errMsg ? 'errmsg' : 'offscreen'} aria-live="assertive">
            {errMsg}
          </p>
          <h1>Registration Page</h1>
          <form onSubmit={handleSubmit} className="form-group">
            <label htmlFor="username">
              Username:
              <FontAwesomeIcon icon={faCheck} className={validName ? 'valid' : 'hide'} />
              <FontAwesomeIcon icon={faTimes} className={validName || !user ? 'hide' : 'invalid'} />
            </label>
            <input
              type="text"
              id="username"
              ref={userRef}
              autoComplete="off"
              onChange={(e) => setUser(e.target.value)}
              value={user}
              required
              aria-invalid={validName ? 'false' : 'true'}
              aria-describedby="uidnote"
              className="form-control"
              onFocus={() => setUserFocus(true)}
              onBlur={() => setUserFocus(false)}
            />

            <label htmlFor="password">
              Password:
              <FontAwesomeIcon icon={faCheck} className={validPwd ? 'valid' : 'hide'} />
              <FontAwesomeIcon icon={faTimes} className={validPwd || !pwd ? 'hide' : 'invalid'} />
            </label>
            <input
              type="password"
              id="password"
              onChange={(e) => setPwd(e.target.value)}
              value={pwd}
              required
              aria-invalid={validPwd ? 'false' : 'true'}
              aria-describedby="pwdnote"
              className="form-control"
              onFocus={() => setPwdFocus(true)}
              onBlur={() => setPwdFocus(false)}
            />

            <label htmlFor="confirm_pwd">
              Confirm Password:
              <FontAwesomeIcon icon={faCheck} className={validMatch && matchPwd ? 'valid' : 'hide'} />
              <FontAwesomeIcon icon={faTimes} className={validMatch || !matchPwd ? 'hide' : 'invalid'} />
            </label>
            <input
              type="password"
              id="confirm_pwd"
              onChange={(e) => setMatchPwd(e.target.value)}
              value={matchPwd}
              required
              aria-invalid={validMatch ? 'false' : 'true'}
              aria-describedby="confirmnote"
              className="form-control"
              onBlur={() => setMatchFocus(false)}
            />
            <Button type="submit">Sign Up</Button>
          </form>
          <p>
            Already registered?
            <br />
            <span className="line">
              <a href="/login">Sign In</a>
            </span>
          </p>
        </section>
      )}
    </ElementStyle>
  );
};

const App = () => (
  <MainContainer>
    <Navbar />
    <Register />
  </MainContainer>
);

export default App;