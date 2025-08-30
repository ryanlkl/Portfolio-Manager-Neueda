import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import '../css/navBar.css';
import { useAuthStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';

// new side bar 
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

  return (
    <>
      <Navbar
        collapseOnSelect
        expand="lg"
        className="bg-body-secondary position-fixed top-0 start-0 vh-100 d-flex flex-column p-3 border-end"
        style={{ width: 240, zIndex: 1030 }}
      >
        <Container fluid className="p-0 d-flex flex-column align-items-stretch h-100">
          <Navbar.Brand href="/portfolio" className="mb-3">PortManager</Navbar.Brand>

          <Navbar.Toggle aria-controls="responsive-navbar-nav" className="mb-2" />

          <Navbar.Collapse id="responsive-navbar-nav" className="d-flex flex-column">
            <Nav className="flex-column w-100">
              <Nav.Link href="/portfolio">Portfolio</Nav.Link>
              <Nav.Link href="/holdings">Holdings</Nav.Link>
            </Nav>

            <Nav className="flex-column w-100 mt-auto mb-5">
              <NavDropdown
                title="Account"
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
              >
                {isLoggedIn ? (
                  <>
                    <NavDropdown.Item href="/account">Profile</NavDropdown.Item>
                    <NavDropdown.Item href="#logout" onClick={handleLogout}>Sign Out</NavDropdown.Item>
                  </>
                ) : (
                  <>
                    <NavDropdown.Item href="/login">Sign In</NavDropdown.Item>
                    <NavDropdown.Item href="/signup">Register</NavDropdown.Item>
                  </>
                )}
              </NavDropdown>

              <Nav.Link
                onClick={toggleTheme}
                role="button"
                className="btn btn-outline-secondary w-100 text-start"
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default NavBar;
