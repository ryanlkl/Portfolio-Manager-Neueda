import React, { useEffect, useState } from "react";
import "../css/Homepage.css";

export default function Homepage() {
  const year = new Date().getFullYear();

  useEffect(() => {
    document.body.classList.add("no-sidebar-pad");
    const updateTheme = () => setTheme(getTheme());
    window.addEventListener("storage", updateTheme);
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-bs-theme"] });
    return () => {
      document.body.classList.remove("no-sidebar-pad");
      window.removeEventListener("storage", updateTheme);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="pm-page" data-bs-theme="dark">
      <nav className="navbar navbar-dark navbar-expand-lg pm-navbar sticky-top">
        <div className="container">
          <div className="navbar-brand fs-4">
            <span className="brand-accent">PortManager</span>
          </div>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#pmNav"
            aria-controls="pmNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div id="pmNav" className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-2">
              <li className="nav-item">
                <a className="btn pm-btn-outline px-3" href="/login">Log In</a>
              </li>
              <li className="nav-item">
                <a className="btn pm-btn-cta px-3" href="/signup">Sign Up</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <header className="container mt-5">
        <div className="pm-hero p-4 p-lg-5 position-relative">
          <div className="pm-glow" />
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="pm-chip">Secure and fast</span>
              <h1 className="display-5 fw-bold mt-3">
                Manage your <span className="brand-accent">portfolio</span> in one space.
              </h1>
              <p className="lead text-secondary mt-2">
                Track holdings, visualise performance, and act quickly.
              </p>
              <div className="d-flex gap-3 mt-3">
                <a className="btn pm-btn-cta btn-lg px-4" href="/signup">Sign Up</a>
                <a className="btn pm-btn-outline btn-lg px-4" href="/login">Log In</a>
              </div>

              <div className="row mt-4 g-3">
                <div className="col-6 col-md-4">
                  <div className="pm-mini-stat p-3">
                    <div className="text-secondary small">Production</div>
                    <div className="fs-5 fw-semibold">Beta</div>
                  </div>
                </div>
                <div className="col-6 col-md-4">
                  <div className="pm-mini-stat p-3">
                    <div className="text-secondary small">Uptime</div>
                    <div className="fs-5 fw-semibold">99.9%</div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="pm-mini-stat p-3">
                    <div className="text-secondary small">Mode</div>
                    <div className="fs-5 fw-semibold">Dark</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual card */}
            <div className="col-lg-5">
              <div className="pm-card p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="pm-icon-badge">PM</div>
                  <span className="text-secondary small">Portfolio Value</span>
                </div>

                <div className="mt-3">
                  <div className="progress mb-2" style={{ height: 10 }}>
                    <div className="progress-bar pm-progress-1" style={{ width: "65%" }} />
                  </div>
                  <div className="progress mb-2" style={{ height: 10 }}>
                    <div className="progress-bar pm-progress-2" style={{ width: "45%" }} />
                  </div>
                  <div className="progress" style={{ height: 10 }}>
                    <div className="progress-bar pm-progress-3" style={{ width: "30%" }} />
                  </div>
                </div>

                <div className="d-flex justify-content-between mt-3">
                  <span className="text-secondary small">YTD Return</span>
                  <span className="text-success">+12.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="pm-section">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="fw-bold">Everything you need to manage assets</h2>
            <p className="text-secondary mb-0">Designed to match your dashboard.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="pm-card h-100 p-4">
                <div className="pm-icon-badge">1</div>
                <h5 className="mb-2 mt-3">Track Holdings</h5>
                <p className="text-secondary mb-0">
                  Add, edit, and remove positions with instant feedback.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="pm-card h-100 p-4">
                <div className="pm-icon-badge">2</div>
                <h5 className="mb-2 mt-3">Visualise Performance</h5>
                <p className="text-secondary mb-0">
                  Charts that mirror your dashboard.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="pm-card h-100 p-4">
                <div className="pm-icon-badge">3</div>
                <h5 className="mb-2 mt-3">Manage Transactions</h5>
                <p className="text-secondary mb-0">
                  Entries for buys, sells, and transfers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="p-4 p-lg-5 pm-hero d-flex flex-column flex-lg-row align-items-center justify-content-between">
            <div className="mb-3 mb-lg-0">
              <h3 className="mb-1">Ready to build your portfolio?</h3>
              <p className="text-secondary mb-0">Create an account or log in to continue.</p>
            </div>
            <div className="d-flex gap-3">
              <a className="btn pm-btn-cta btn-lg px-4" href="/signup">Sign Up</a>
              <a className="btn pm-btn-outline btn-lg px-4" href="/login">Log In</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="pm-footer py-4">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div className="text-secondary small">© {year} PortManager</div>
          <div className="text-secondary small">All rights reserved</div>
        </div>
      </footer>
    </div>
  );
}
