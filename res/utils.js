window.onload = function () {
    const navButton = document.getElementById("nav-button");
    const navPanel = document.getElementById("nav-panel");
    const navItems = document.getElementsByClassName("nav-item");
    const navSubItems = document.getElementsByClassName("nav-sub-item");

    const toggleNavPanel = () => {
        gtag('event', 'click', {
            'event_category': 'navigation',
            'event_label': 'nav button',
            'value': 'Navigation button clicked'
        });
        const status = navPanel.style.display;
        if (status == "none") {
            navPanel.style.display = "block";
        } else {
            navPanel.style.display = "none";
        }
    }

    navButton.addEventListener('click', toggleNavPanel);

    for (var i = 0; i < navItems.length; ++i){
        navItems[i].addEventListener("click", function (e) {
            const p = e.target.dataset.page;
            navigateToPage(p);
        })
    };
    for (var i = 0; i < navSubItems.length; ++i) {
        navSubItems[i].addEventListener("click", function (e) {
            const p = e.target.dataset.page;
            navigateToPage(p);
        })
    };

    document.addEventListener('click', function (e) {
        if (!(e.target.id == "nav-button" || e.target.id == "nav-panel" || e.target.id == "nav-image" || e.target.tagName == "OL" || e.target.tagName == "UL")) {
            navPanel.style.display = "none";
        }
    });

}

function recordDownload() {
    gtag('event', 'download', {
        'event_category': 'download',
        'event_label': 'download',
        'value': 'Yearbook pdf downloaded'
    });
}