import React from 'react';
import '../styles/Footer.css';

const LinkedInIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
    >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="site-footer" role="contentinfo">
            <div className="footer-inner">
                <div className="footer-brand">
                    <span className="footer-logo">Income Planner</span>
                    <p className="footer-tagline">
                        Free investment calculator for SIP, SWP, Step-Up SIP, and Lumpsum plans.
                        Combine everything into one basket and see the full picture.
                    </p>
                </div>

                <div className="footer-links">
                    <div className="footer-col">
                        <h3 className="footer-heading">Calculators</h3>
                        <ul>
                            <li>SIP Calculator</li>
                            <li>SWP Calculator</li>
                            <li>Step-Up SIP Calculator</li>
                            <li>Lumpsum Calculator</li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h3 className="footer-heading">Resources</h3>
                        <ul>
                            <li><a href="#seo-content">About Income Planner</a></li>
                            <li><a href="#how-to-use">How to Use</a></li>
                            <li><a href="#common-questions">Common Questions</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h3 className="footer-heading">Team</h3>
                        <ul>
                            <li>
                                <a
                                    href="https://www.linkedin.com/in/divyansh-sharma-158b04193/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-team-link"
                                >
                                    <LinkedInIcon /> Divyansh Sharma
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://www.linkedin.com/in/siddhant-linked/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-team-link"
                                >
                                    <LinkedInIcon /> Siddhant Rajput
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} Income Planner</p>
                    <p className="footer-note">
                        This tool is for informational purposes only. It does not constitute financial advice. Always consult a qualified financial advisor before making investment decisions.
                    </p>
                </div>
            </div>
        </footer>
    );
};
