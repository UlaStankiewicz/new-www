(function () {
    function findRelative(element, selector) {
        do {
            const target = element.querySelector(selector)
            if (target) {
                return target
            }
            element = element.parentNode;
        } while (element);
        return null;
    }

    document.addEventListener('submit', function (e) {
        const form = e.target;
        const formType = form.dataset.formType;

        const doneNode = findRelative(form, '.form-success');
        const failNode = findRelative(form, '.form-error');
        const submitButton = form.querySelector('[type=submit]');

        function showDone() {
            doneNode.style.display = 'block';
            failNode.style.display = 'none';
            submitButton.style.display = 'none';
        }

        function showFail() {
            doneNode.style.display = 'none';
            failNode.style.display = 'block';
        }

        if (formType === 'contact' || formType === 'start-a-project') {
            e.preventDefault();
            fetch("https://prod-38.northeurope.logic.azure.com/workflows/1d03b23263424a8a8bef4287c5c50add/triggers/manual/paths/invoke/contact?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=uAHDF64Wovfav_yXqKz2l2m_MZ-f9kAzDx6i49kDGq0", {
                method: 'POST',
                body: new FormData(form),
            }).then(showDone, showFail)
        }

        if (formType === 'job') {
            e.preventDefault();
            fetch("https://prod-50.northeurope.logic.azure.com/workflows/ebe3138deb79483499fece1fdb88d591/triggers/manual/paths/invoke/job?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZFCcJhp_9FTFToWYjRfl4uoeqGDQOS-_4z0TpVjAgUk", {
                method: 'POST',
                body: new FormData(form),
            }).then(showDone, showFail)
        }
    }, true);

    document.addEventListener('change', (event)=> {
        const fileInput = event.target;
        if(fileInput.type === 'file'){
            const fileNameElement = findRelative(fileInput, '.file-label .file-name');
            if(fileNameElement){
                fileNameElement.innerText = fileInput.value;
            }
        }
    });
    // navbar
    // https://bulma.io/documentation/components/navbar/#navbar-burger
    document.addEventListener('DOMContentLoaded', () => {

        // Get all "navbar-burger" elements
        const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

        // Check if there are any navbar burgers
        if ($navbarBurgers.length > 0) {

            // Add a click event on each of them
            $navbarBurgers.forEach(el => {
                el.addEventListener('click', () => {

                    // Get the target from the "data-target" attribute
                    const target = el.dataset.target;
                    const $target = document.querySelector(target);

                    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
                    el.classList.toggle('is-active');
                    $target.classList.toggle('is-active');

                });
            });
        }

    });

    function urlWithSearchParams(searchParams) {
        return window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString();
    }

    document.addEventListener('DOMContentLoaded', () => {
        const tabSets = document.querySelectorAll('.tabs[data-tabs-content]');
        tabSets.forEach(tabSet => {
            const contentSelector = tabSet.getAttribute("data-tabs-content");
            const tabsParamName = `tabs${contentSelector}`;
            const tabContents = document.querySelectorAll(contentSelector);
            const tabs = tabSet.querySelectorAll('ul>li');
            let urlParams = null;

            function selectTabAtIndex(index) {
                tabs.forEach((tab, ix) => {
                    tab.classList.toggle("is-active", ix === index);
                    tabContents.item(ix).classList.toggle("is-hidden", ix !== index);
                });
                if (urlParams) {
                    urlParams.set(tabsParamName, index);
                    const newUrl = urlWithSearchParams(urlParams);
                    window.history.replaceState({ path: newUrl }, '', newUrl);
                }
            }

            tabs.forEach((tab, index) => {
                tab.addEventListener('click', () => selectTabAtIndex(index))
            });

            let selectedIndex = 0;
            try {
                urlParams = new URLSearchParams(window.location.search);
                const indexParam = urlParams.get(tabsParamName);
                if (indexParam) {
                    selectedIndex = parseInt(indexParam, 10);
                }
            } catch (e) {
            }

            selectTabAtIndex(selectedIndex);
        });
    });
}());
