let pageview;
let pages = 1;

const unloadedPages = {};

function recordPageView(pn) {
    gtag('event', 'pageview', {
        'event_category': 'pageview',
        'event_label': 'Page ' + pn,
        'value': 'Page ' + pn + ' viewed',
        // 'non_interaction': true
    });
}

const loadPage = async pn => {
    // console.log("Loading: ", pn);
    if (unloadedPages[pn]) {
        unloadedPages[pn] = 0;
    }
    return new Promise((resolve, reject) => {
        if (pn > 115) {
            resolve(pn);
        }
        // If absolute URL from the remote server is provided, configure the CORS
        // header on that server.
        var url = 'https://kushwahasameerkumar.github.io/ecell-yearbook/res/yearbook/ecell_yearbook_' + pn + '.pdf';
        // var url = 'http://localhost:3000/yearbook/ecell_yearbook_' + pn + '.pdf';

        // Loaded via <script> tag, create shortcut to access PDF.js exports.
        var pdfjsLib = window['pdfjs-dist/build/pdf'];

        // The workerSrc property shall be specified.
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.js';

        // Asynchronous download of PDF
        var loadingTask = pdfjsLib.getDocument(url);
        loadingTask.promise.then(function (pdf) {
            // console.log('PDF loaded');

            // Fetch the first page
            var pageNumber = 1;
            pdf.getPage(pageNumber).then(function (page) {
                // console.log('Page loaded');

                var scale = 1.5;
                var viewport = page.getViewport({ scale: scale });

                //for navigation
                pageview = viewport;

                // Prepare canvas using PDF page dimensions
                const canvasId = "pdf-canvas-" + pn;
                var canvas = document.getElementById(canvasId);
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                var renderTask = page.render(renderContext);
                renderTask.promise.then(function () {
                    // console.log('Page rendered');
                    if (unloadedPages[pn]) {
                        delete unloadedPages[pn];
                    }
                    recordPageView(pn);
                    resolve(pn);
                });
            });
        }, function (reason) {
            // PDF loading error
                console.error(reason);
                reject(pn);
        });
    });
};

const createPage = pageNumber => {
    const canvas = document.createElement("canvas");
    canvas.id = "pdf-canvas-" + pageNumber;
    canvas.class = "pdf-canvas";
    // canvas.setAttribute("data-page", pageNumber);

    if (pageview) {
        canvas.height = pageview.height;
        canvas.width = pageview.width;

        var image = new Image();
        image.src = 'res/img/loading.png';
        image.onload = function () {
            var canvasContext = canvas.getContext('2d');
            var wrh = image.width / image.height;
            var newWidth = canvas.width;
            var newHeight = newWidth / wrh;
            if (newHeight > canvas.height) {
                newHeight = canvas.height;
                newWidth = newHeight * wrh;
            }
            var xOffset = newWidth < canvas.width ? ((canvas.width - newWidth) / 2) : 0;
            var yOffset = newHeight < canvas.height ? ((canvas.height - newHeight) / 2) : 0;

            canvasContext.drawImage(image, xOffset, yOffset, newWidth, newHeight);
        };
    }

    document.getElementById("ebook").appendChild(canvas);
    unloadedPages[pageNumber] = 1;
    // $("#pdf-canvas-" + pageNumber).focus(focusHandler);
};


const appendPage = async pageNumber => {
    createPage(pageNumber);
    showLoadingOnPage(pageNumber);
    await loadPage(pageNumber);
    return "Append completed";
};

const showLoadingOnPage = () => {
    const pageCanvas = document.getElementById("loading");
    pageCanvas.style.display = 'block';
};

const hideLoadingOnPage = () => {
    const loading = document.getElementById("loading");
    loading.style.display = 'none';
}

let loading = false;
let finished = false;

//navigation start
const goto = (page) => {
    const element = document.getElementById("pdf-canvas-" + page);
    element.scrollIntoView();
}

const navigateToPage = (pageNumber) => {
    gtag('event', 'click', {
        'event_category': 'navigation',
        'event_label': 'Page ' + pageNumber,
        'value': 'Navigation to page ' + pageNumber
    });
    if (pageNumber < pages) {
        goto(pageNumber);
    }
    else {
        for (; pages <= pageNumber; ++pages) {
            createPage(pages);
        }
        goto(pageNumber);
    }
};

const isInViewport = function (elem) {
    var bounding = elem.getBoundingClientRect();
    return (
        bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

//navigation end

//navigate to page on load, if page in URL
let urlNavFocused = false;
let pageURL = false;
let urlPage;
const queryString = window.location.search;
if (queryString) {
    const params = new URLSearchParams(queryString);
    const pageNo = params.get("page");
    if (pageNo) {
        urlPage = pageNo;
        pageURL = true;
        pages = 1;
        console.log(pageNo);
        navigateToPage(pageNo);
        // setTimeout(function () {
        //     // urlNavFocused = true;
        // }, 3000);
        setTimeout(function () {
            navigateToPage(pageNo);
        }, 2000);
        // setTimeout(function () {
        //     navigateToPage(pageNo);
        // }, 4000);
        gtag('event', 'topic', {
            'event_category': 'topic',
            'event_label': 'Page ' + pageNo,
            'value': 'Navigation from URL'
        });
    }
}

// $(document).on('touchmove', onScroll); // for mobile
// Endless scroll 
$(window).scroll(onScroll);

function onScroll() {
    //load unloaded pages
    if (pageURL && !urlNavFocused) {
        navigateToPage(urlPage);
        urlNavFocused = true;
    }

    if (urlNavFocused || !pageURL) {
        for (var pn = 1; pn < pages; ++pn) {
            if ($("#pdf-canvas-" + pn).visible(true)) {
                // console.log("Focus", pn);
                if (unloadedPages[pn]) {
                    loadPage(pn);
                }
                //load backward
                if (unloadedPages[pn - 1]) {
                    loadPage(pn - 1);
                }
                //load forward
                if (unloadedPages[pn + 1]) {
                    loadPage(pn + 1);
                }
            }
        }
    }
    // if (Object.keys(unloadedPages).length > 0) {
    //     for (pn in unloadedPages) {
    //         if (unloadedPages[pn] == 1) {
    //             const element = document.getElementById("pdf-canvas-" + pn);
    //             if ($("#pdf-canvas-" + pn).visible(true)) {
    //                 console.log("Focus", pn);
    //                 loadPage(pn);
    //                 loadPage(pn - 1);
    //                 unloadedPages[pn] = 0;
    //             }
    //         }
    //     }
    // }

    //debug
    // document.getElementById("download").innerHTML = `Scroll top: ${$(window).scrollTop()}, document height: ${$(document).height()}, window-height: ${$(window).height()}`;
    if ($(window).scrollTop() >= $(document).height() - (2 * $(window).height())) {
        // run our call for pagination
        //load next 2 pages
        if (!loading && pages <= 115) {
            loading = true;
            showLoadingOnPage();
            appendPage(pages++).catch(pageNumber => {
                //try to load one more time upon failure
                loadPage(pageNumber);
            });
            appendPage(pages++).then(() => {
                hideLoadingOnPage();
                loading = false;
                if (pages >= 115) {
                    finished = true;
                    document.getElementById("finished").style.display = "block";
                }
            }).catch(pageNumber => {
                //try to load one more time upon failure
                loadPage(pageNumber);
            });
        }
    }
}

// Initialize pages 
if (!pageURL) {
    appendPage(1);
    appendPage(2);
    appendPage(3);
    appendPage(4);

    pages = 5;
}