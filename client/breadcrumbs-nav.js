document.addEventListener('DOMContentLoaded', function() {
    // Check if template data is available
    if (!window.siteTemplateData) {
        console.error('Template data not available. Make sure the inline script is loaded first.');
        return;
    }

    const templateData = window.siteTemplateData;

    // Site configuration
    const siteConfig = {
        pathNames: {
            'en': {
                'archive': 'Archive',
                'events': 'Events',
                'artists': 'Artists',
                'exhibitions': 'Exhibitions',
                'kunstenaars': 'Artists', // Handle mixed language URLs
                'exposities': 'Exhibitions'
            },
            'nl': {
                'archief': 'Archief', 
                'events': 'Events',
                'kunstenaars': 'Kunstenaars',
                'exposities': 'Exposities',
                'artists': 'Kunstenaars', // Handle mixed language URLs
                'exhibitions': 'Exposities'
            }
        }
    };

    // Generate breadcrumbs
    function generateBreadcrumbs() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(segment => segment !== '');
        const breadcrumbContainer = document.getElementById('breadcrumbs');
        
        if (!breadcrumbContainer) {
            console.warn('Breadcrumb container not found');
            return;
        }

        if (segments.length === 0) {
            breadcrumbContainer.innerHTML = `<a href="/">${templateData.translations.home}</a>`;
            return;
        }

        const language = templateData.lang;
        
        let breadcrumbHTML = `<a href="/">${templateData.translations.home}</a>`;
        let currentPath = '';
        
        segments.forEach((segment, index) => {
            currentPath += '/' + segment;
            const isLast = index === segments.length - 1;
            
            let displayName = segment;
            
            // Handle specific segments
            if (index === 0) {
                // Language segment
                if (segment === 'en') {
                    displayName = templateData.translations.english;
                } else if (segment === 'nl') {
                    displayName = templateData.translations.dutch;
                } else {
                    displayName = segment.charAt(0).toUpperCase() + segment.slice(1);
                }
            } else if (segment === 'archive' || segment === 'archief') {
                displayName = templateData.translations.archive;
            } else if (segment.match(/^[a-f0-9-]{36}$/)) {
                // UUID - use actual title if available
                if (templateData.eventTitle && templateData.eventUuid === segment) {
                    displayName = templateData.eventTitle;
                } else if (templateData.personName && templateData.personUuid === segment) {
                    displayName = templateData.personName;
                } else {
                    displayName = templateData.translations.details;
                }
            } else if (siteConfig.pathNames[language] && siteConfig.pathNames[language][segment]) {
                displayName = siteConfig.pathNames[language][segment];
            } else {
                // Capitalize and clean up
                displayName = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
            }
            
            if (isLast) {
                breadcrumbHTML += ` <span>></span> <span class="current">${escapeHtml(displayName)}</span>`;
            } else {
                breadcrumbHTML += ` <span>></span> <a href="${currentPath}">${escapeHtml(displayName)}</a>`;
            }
        });
        
        breadcrumbContainer.innerHTML = breadcrumbHTML;
    }

    // Track navigation history
    function trackNavigationHistory() {
        try {
            let navHistory = JSON.parse(sessionStorage.getItem('navHistory') || '[]');
            const currentPage = {
                url: window.location.href,
                pathname: window.location.pathname,
                title: document.title,
                timestamp: Date.now()
            };
            
            const lastPage = navHistory[navHistory.length - 1];
            if (!lastPage || lastPage.pathname !== currentPage.pathname) {
                navHistory.push(currentPage);
                
                // Keep only last 10 pages
                if (navHistory.length > 10) {
                    navHistory = navHistory.slice(-10);
                }
                
                sessionStorage.setItem('navHistory', JSON.stringify(navHistory));
            }
        } catch (error) {
            console.warn('Could not access sessionStorage:', error);
        }
    }

    // Initialize back button
    function initBackButton() {
        const backButton = document.getElementById('back-arrow');
        
        if (!backButton) {
            console.warn('Back button not found');
            return;
        }
        
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            try {
                const navHistory = JSON.parse(sessionStorage.getItem('navHistory') || '[]');
                
                if (navHistory.length > 1) {
                    // Go to previous page in tracked history
                    const previousPage = navHistory[navHistory.length - 2];
                    window.location.href = previousPage.url;
                    return;
                }
            } catch (error) {
                console.warn('Could not access navigation history:', error);
            }
            
            // Fallback to browser history
            if (window.history.length > 1) {
                window.history.back();
                return;
            }
            
            // Final fallback: construct parent URL
            const path = window.location.pathname;
            const segments = path.split('/').filter(segment => segment !== '');
            
            if (segments.length > 1) {
                segments.pop();
                window.location.href = '/' + segments.join('/');
            } else {
                window.location.href = '/';
            }
        });
    }

    // Utility function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize everything
    generateBreadcrumbs();
    trackNavigationHistory();
    initBackButton();

    // Update breadcrumbs on popstate (browser back/forward)
    window.addEventListener('popstate', function() {
        setTimeout(generateBreadcrumbs, 50); // Small delay to ensure URL is updated
    });
});