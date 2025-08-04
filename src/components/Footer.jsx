// src/components/Footer.jsx

import React from 'react';
import { FaGithub, FaLinkedin, FaGlobe } from 'react-icons/fa'; // Using icons for a nice touch

const Footer = () => {
  // Replace with your actual links!
  const yourLinks = {
    github: 'https://github.com/ashfaknawshad',
    linkedin: 'https://www.linkedin.com/in/ashfaknawshad/', // Add your LinkedIn
    portfolio: 'https://your-portfolio.com' // Add your portfolio or personal site
  };

  return (
    <footer className="w-full mt-auto py-6 px-4">
      <div className="max-w-4xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Developed with ♡ by{' '}
          <a
            href={yourLinks.portfolio || yourLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ashfak Nawshad
          </a>
          .
        </p>
        <div className="flex justify-center items-center gap-4 mt-2">
          <a href={yourLinks.github} target="_blank" rel="noopener noreferrer" className="hover:text-gray-800 dark:hover:text-white transition-colors" aria-label="GitHub Profile">
            <FaGithub size={20} />
          </a>
          {yourLinks.linkedin && (
            <a href={yourLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-gray-800 dark:hover:text-white transition-colors" aria-label="LinkedIn Profile">
              <FaLinkedin size={20} />
            </a>
          )}
          {yourLinks.portfolio && (
            <a href={yourLinks.portfolio} target="_blank" rel="noopener noreferrer" className="hover:text-gray-800 dark:hover:text-white transition-colors" aria-label="Portfolio Website">
              <FaGlobe size={20} />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;