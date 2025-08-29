import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';

function NavBar() {
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

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-secondary">
      <Container>
        <Navbar.Brand href="/portfolio">PortManager</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/portfolio">Portfolio</Nav.Link>
            <Nav.Link href="/holdings">Holdings</Nav.Link>
            <Nav.Link href="/performance">Performance</Nav.Link>
          </Nav>
          <Nav className="align-items-center">
            <Button
              variant="outline-secondary"
              className="me-2"
              onClick={toggleTheme}
              aria-label="Toggle color mode"
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <NavDropdown title="Account" id="collapsible-nav-dropdown">
              <NavDropdown.Item href="/login">Sign In</NavDropdown.Item>
              <NavDropdown.Item href="/signup">Register</NavDropdown.Item>
              <NavDropdown.Item href="#logout">Sign Out</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
