const loadPage = async pn => {
    return new Promise((resolve, reject) => {
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
            console.log('PDF loaded');

            // Fetch the first page
            var pageNumber = 1;
            pdf.getPage(pageNumber).then(function (page) {
                console.log('Page loaded');

                var scale = 1.5;
                var viewport = page.getViewport({ scale: scale });

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
                    console.log('Page rendered');
                    resolve("Page rendered");
                });
            });
        }, function (reason) {
            // PDF loading error
                console.error(reason);
                reject(reason);
        });
    });
};

const createPage = pageNumber => {
    const canvas = document.createElement("canvas");
    canvas.id = "pdf-canvas-" + pageNumber;
    canvas.class = "pdf-canvas";

    document.getElementById("ebook").appendChild(canvas);
};


const appendPage = async pageNumber => {
    createPage(pageNumber);
    // showLoadingOnPage(pageNumber);
    await loadPage(pageNumber);
    return "Append completed";
};

const showLoadingOnPage = page => {
    const pageCanvas = document.getElementById("ebook");
    const loading = `<div id="loading-${page}" style="justify-content: center; align-content: center"> LOADING PAGE ${page}... </div>`;
    pageCanvas.innerHTML += loading;
};

const hideLoadingOnPage = page => {
    const loading = document.getElementById("loading-" + page);
    if (loading) {
        loading.parentNode.removeChild(loading);
    }
}

// Endless scroll 
$(window).scroll(function () {
    if ($(window).scrollTop() == $(document).height() - $(window).height()) {
        // run our call for pagination
        const currentPage = pages++;
        appendPage(currentPage);
    }
});

let pages = 5;
// Initialize pages 
appendPage(1);
appendPage(2);
appendPage(3);
appendPage(4);