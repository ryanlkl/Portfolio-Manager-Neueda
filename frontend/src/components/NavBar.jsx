import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import '../css/navBar.css';
import { useAuthStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';

// Add sun and moon SVGs
const SunIcon = (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="4" />
    <g stroke="currentColor" strokeWidth="1.5">
      <line x1="10" y1="1" x2="10" y2="3" />
      <line x1="10" y1="17" x2="10" y2="19" />
      <line x1="3.22" y1="3.22" x2="4.64" y2="4.64" />
      <line x1="15.36" y1="15.36" x2="16.78" y2="16.78" />
      <line x1="1" y1="10" x2="3" y2="10" />
      <line x1="17" y1="10" x2="19" y2="10" />
      <line x1="3.22" y1="16.78" x2="4.64" y2="15.36" />
      <line x1="15.36" y1="4.64" x2="16.78" y2="3.22" />
    </g>
  </svg>
);

const MoonIcon = (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8 8 0 1010.586 10.586z" />
  </svg>
);

function NavBar() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const logout = useAuthStore((state) => state.logout);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  const handleLogout = () => {
    logout();
    navigate("/signup");
  };

  // Theme-dependent styles
  const isDark = theme === 'dark';
  const navBg = isDark ? "#181b20" : "#fff";
  const navBorder = isDark ? "1.5px solid #23272b" : "1.5px solid #e0e0e0";
  const navShadow = isDark ? "2px 0 8px rgba(0,0,0,0.12)" : "2px 0 8px rgba(0,0,0,0.04)";
  const brandColor = isDark ? "#51cf66" : "#198754";
  const linkColor = isDark ? "#fff" : "#23272b";
  const linkActive = isDark ? "#51cf66" : "#198754";
  const dropdownBg = isDark ? "#23272b" : "#f8f9fa";
  const dropdownHover = isDark ? "#181b20" : "#e9ecef";
  const dropdownText = isDark ? "#fff" : "#23272b";
  const dropdownAccent = isDark ? "#51cf66" : "#198754";
  const borderColor = isDark ? "#343a40" : "#dee2e6";
  const themeBtnBg = isDark ? "#23272b" : "#f8f9fa";
  const themeBtnColor = isDark ? "#adb5bd" : "#23272b";

  return (
    <>
      <Navbar
        collapseOnSelect
        expand="lg"
        className="custom-navbar position-fixed top-0 start-0 vh-100 d-flex flex-column p-3 border-end"
        style={{
          width: 240,
          zIndex: 1030,
          background: navBg,
          borderRight: navBorder,
          boxShadow: navShadow,
          transition: "background 0.2s, border 0.2s"
        }}
      >
        <Container fluid className="p-0 d-flex flex-column align-items-stretch h-100">
          <Navbar.Brand
            href="/portfolio"
            className="mb-3"
            style={{
              color: brandColor,
              fontWeight: 700,
              fontSize: "1.45em",
              letterSpacing: 1,
              textShadow: isDark ? "0 1px 2px #000" : "none"
            }}
          >
            PortManager
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="responsive-navbar-nav" className="mb-2" />

          <Navbar.Collapse id="responsive-navbar-nav" className="d-flex flex-column">
            <Nav className="flex-column w-100">
              <Nav.Link
                href="/portfolio"
                style={{
                  color: linkColor,
                  fontWeight: 600,
                  borderRadius: 8,
                  marginBottom: 4,
                  padding: "8px 16px"
                }}
                className="nav-link-custom"
              >
                Portfolio
              </Nav.Link>
              <Nav.Link
                href="/holdings"
                style={{
                  color: linkColor,
                  fontWeight: 600,
                  borderRadius: 8,
                  marginBottom: 4,
                  padding: "8px 16px"
                }}
                className="nav-link-custom"
              >
                Holdings
              </Nav.Link>
              <Nav.Link
                href="/transactions"
                style={{
                  color: linkColor,
                  fontWeight: 600,
                  borderRadius: 8,
                  marginBottom: 4,
                  padding: "8px 16px"
                }}
                className="nav-link-custom"
              >
                Transactions
              </Nav.Link>
            </Nav>

            <Nav className="flex-column w-100 mt-auto mb-5">
              <NavDropdown
                title={<span style={{ color: linkColor, fontWeight: 600 }}>Account</span>}
                id="account-menu"
                drop="up"
                align="start"
                className="w-100"
                renderMenuOnMount
                popperConfig={{
                  strategy: 'fixed',
                  modifiers: [
                    { name: 'offset', options: { offset: [0, 6] } },
                    { name: 'preventOverflow', options: { boundary: 'viewport' } },
                  ],
                }}
                style={{
                  background: dropdownBg,
                  borderRadius: 8,
                  color: dropdownText
                }}
                menuVariant={isDark ? "dark" : "light"}
              >
                {isLoggedIn ? (
                  <>
                    <NavDropdown.Item href="/account" style={{ color: dropdownAccent, fontWeight: 600 }}>Profile</NavDropdown.Item>
                    <NavDropdown.Item href="#logout" onClick={handleLogout} style={{ color: "#ff6b6b", fontWeight: 600 }}>Sign Out</NavDropdown.Item>
                  </>
                ) : (
                  <>
                    <NavDropdown.Item href="/login" style={{ color: dropdownAccent, fontWeight: 600 }}>Sign In</NavDropdown.Item>
                    <NavDropdown.Item href="/signup" style={{ color: "#36A2EB", fontWeight: 600 }}>Register</NavDropdown.Item>
                  </>
                )}
              </NavDropdown>
              {/* Theme Switch */}
              <div
                className="mt-3"
                style={{
                  width: 100,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  userSelect: "none",
                  background: "transparent",
                  border: "none",
                  outline: "none"
                }}
                onClick={toggleTheme}
                role="button"
                tabIndex={0}
              >
                <span
                  style={{
                    width: 64,
                    height: 36,
                    borderRadius: 18,
                    background: themeBtnBg,
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                    transition: "background 0.2s, border 0.2s"
                  }}
                >
                  {/* Bar */}
                  <span
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 50,
                      height: 12,
                      borderRadius: 6,
                      background: isDark ? "#343a40" : "#dee2e6",
                      transition: "background 0.2s"
                    }}
                  />
                  {/* Circle with icon */}
                  <span
                    style={{
                      position: "absolute",
                      left: isDark ? 36 : 6,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: isDark ? "#23272b" : "#f8f9fa",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.10)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "left 0.2s, background 0.2s"
                    }}
                  >
                    {isDark ? (
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8 8 0 1010.586 10.586z" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="7" />
                        <g stroke="currentColor" strokeWidth="1.5">
                          <line x1="10" y1="1" x2="10" y2="3" />
                          <line x1="10" y1="17" x2="10" y2="19" />
                          <line x1="3.22" y1="3.22" x2="4.64" y2="4.64" />
                          <line x1="15.36" y1="15.36" x2="16.78" y2="16.78" />
                          <line x1="1" y1="10" x2="3" y2="10" />
                          <line x1="17" y1="10" x2="19" y2="10" />
                          <line x1="3.22" y1="16.78" x2="4.64" y2="15.36" />
                          <line x1="15.36" y1="4.64" x2="16.78" y2="3.22" />
                        </g>
                      </svg>
                    )}
                  </span>
                </span>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <style>
        {`
        .custom-navbar .nav-link-custom:hover, .custom-navbar .nav-link-custom.active {
          background: ${dropdownBg} !important;
          color: ${linkActive} !important;
        }
        .custom-navbar .dropdown-menu {
          background: ${dropdownBg} !important;
          border-radius: 8px !important;
        }
        .custom-navbar .dropdown-item:hover, .custom-navbar .dropdown-item:focus {
          background: ${dropdownHover} !important;
          color: ${dropdownAccent} !important;
        }
        @media (max-width: 991px) {
          .custom-navbar {
            width: 100vw !important;
            height: auto !important;
            min-height: 56px;
            position: static !important;
            border-radius: 0 !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          }
        }
        `}
      </style>
    </>
  );
}

export default NavBar;
