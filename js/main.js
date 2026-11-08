/* Project sheets adapted from the approved prototype. */
(() => {
  'use strict';

  const root = document.getElementById('za-flightline-hybrid');
  if (!root) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sheet = root.querySelector('#flight-project-sheet');
  const projectButtons = [...root.querySelectorAll('[data-flight-project]')];
  const title = root.querySelector('#flight-sheet-title');
  let selectedProject = null;

  // Project descriptions and impact figures are supplied by the portfolio owner.
  const projects = {
    partwise: {
      title: 'Partwise',
      summary: 'Partwise is an internal platform I designed and built at Communications & Power Industries (CPI) to bring engineering tools and information into one place. One of its core features automates Bill of Materials (BOM) lifecycle analysis, replacing a manual review process that previously took weeks and was performed quarterly.',
      role: 'Sole developer, responsible for requirements, architecture, development, security, deployment, and documentation.',
      impact: [
        'Replaced quarterly manual component reviews with automated analysis that teams can access on demand.',
        'Made component lifecycle information available to engineering, supply chain, and program management, reducing reliance on a single person to perform reviews.',
        'Brought together information from existing company systems and external component data sources to support more timely component reviews and planning.',
        'Worked directly with stakeholders to understand their needs, review the solution, and complete user acceptance testing before deployment.'
      ],
      implementation: [
        'Built the backend in Python using FastAPI, with SQLite for application data storage.',
        'Developed the web interface using HTML, JavaScript, and Tailwind CSS, giving users a browser-based way to access the platform’s tools.',
        'Integrated PLM and ERP systems with the SiliconExpert API to retrieve BOM structures and component lifecycle information.',
        'Containerized and deployed the application using Docker on a self-managed Ubuntu Linux virtual machine, with Nginx serving the application.',
        'Implemented Microsoft Entra ID authentication to connect application access with the company’s identity system.',
        'Set up automated dependency vulnerability scans and worked with IT through infrastructure and security reviews.',
        'Created and maintained Confluence documentation for the platform and its supporting workflows.'
      ],
      technologies: ['Python', 'FastAPI', 'SQLite', 'HTML', 'JavaScript', 'Tailwind CSS', 'REST APIs', 'Docker', 'Ubuntu Linux', 'Nginx', 'Microsoft Entra ID', 'SiliconExpert', 'Confluence']
    },
    purchase_orders: {
      title: 'Purchase Order Automation',
      summary: 'An internal automation workflow I developed at CPI to read purchase orders, extract the required information, log orders, and track their progress through order entry. The workflow connects AI document processing with Excel trackers, ERP data, and automated leadership reporting.',
      role: 'Project owner and developer, with contributions from another intern.',
      impact: [
        'Processes 1,000+ purchase orders per month, with approximately 30 routed for manual review.',
        'Replaced daily document-by-document review and repetitive manual logging, reducing the need to re-enter information from customer documents.',
        'Supports different customer document formats rather than requiring every purchase order to follow the same layout.',
        'Flags discrepancies, including conflicting quantities and prices across related documents, so they can be reviewed and corrected.',
        'Gives teams visibility into order-entry progress and delivers automated daily reports to VPs and the Division President.'
      ],
      implementation: [
        'Built the workflow in Microsoft Power Automate, connecting document intake, information extraction, logging, tracking, and reporting.',
        'Trained a customer-specific AI Builder document extraction model for formats representing approximately 80% of purchase order volume.',
        'Used general document extraction models and LLM calls to handle the remaining customer formats and variations in document structure.',
        'Added checks to identify inconsistent information across related documents, including differences in quantities and prices.',
        'Logged extracted information into Excel trackers and combined it with JDE ERP data to monitor how orders progressed through the entry process.',
        'Included a manual review path for documents requiring human attention, allowing automation and exception handling to operate within the same workflow.'
      ],
      technologies: ['Microsoft Power Automate', 'AI Builder', 'LLM integration', 'Excel', 'JDE ERP']
    }
  };

  function renderList(element, items) {
    element.replaceChildren(...items.map(text => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    }));
  }

  function closeProject() {
    sheet.hidden = true;
    projectButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
    selectedProject?.focus({ preventScroll: true });
    selectedProject = null;
  }

  projectButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (selectedProject === button) {
        closeProject();
        return;
      }
      const project = projects[button.dataset.flightProject];
      selectedProject = button;
      projectButtons.forEach(item => item.setAttribute('aria-expanded', String(item === button)));
      title.textContent = project.title + ' / Project details';
      root.querySelector('#flight-case-summary').textContent = project.summary;
      root.querySelector('#flight-case-role').textContent = project.role;
      renderList(root.querySelector('#flight-case-impact'), project.impact);
      renderList(root.querySelector('#flight-case-implementation'), project.implementation);
      renderList(root.querySelector('#flight-case-technologies'), project.technologies);
      const link = root.querySelector('#flight-case-link');
      link.href = 'mailto:zunayedishmum@gmail.com?subject=' + encodeURIComponent('About ' + project.title);
      link.textContent = 'Discuss ' + project.title + ' ↗';
      sheet.hidden = false;
      title.focus({ preventScroll: true });
      sheet.scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    });
  });

  root.querySelector('#flight-sheet-close').addEventListener('click', closeProject);
  sheet.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeProject();
    }
  });

})();
