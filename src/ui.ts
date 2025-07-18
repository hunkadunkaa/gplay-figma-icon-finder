import "./style.css";

declare const process: {
    env: {
        VERCEL_API_BASE_URL: string;
        FIGMA_PLUGIN_API_KEY: string;
    };
};

const root = document.getElementById("root");

if (root) {
    root.innerHTML = `
    <h1 class="text-lg font-bold mb-3 text-gray-800" > Play Store Icon Finder </h1>
    <div class="flex space-x-2 mb-3">
    <input type="text" id="searchInput" class="flex-grow border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder = "Nhập tên ứng dụng..." >
    <button id="searchButton" type="button" class="bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center cursor-pointer" >
    <svg xmlns="http://www.w3.org/2000/svg" width = "16" height = "16" fill = "currentColor" class="bi bi-search" viewBox = "0 0 16 16" > <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" /> </svg>
    </button>
    </div>

    <!-- Options -->
    <div class="mb-3 text-sm" >
    <div class="flex items-center justify-between" >
    <div> <label for= "countrySelect" class= "font-medium text-gray-600 mr-2"> Quốc gia: </label>
    <select id="countrySelect" class="border border-gray-300 rounded-md px-2 py-1 text-sm">
    <option value="us">United States</option>
    <option value="vn">Vietnam</option>
    <option value="jp">Japan</option>
    <option value="kr">South Korea</option>
    <option value="gb">United Kingdom</option>
    <option value="de">Germany</option>
    <option value="fr">France</option>
    <option value="ru">Russia</option>
    <option value="in">India</option>
    <option value="id">Indonesia</option>
    <option value="th">Thailand</option>
    <option value="my">Malaysia</option>
    <option value="sg">Singapore</option>
    <option value="ph">Philippines</option>
    <option value="br">Brazil</option>
    <option value="mx">Mexico</option>
    <option value="ca">Canada</option>
    <option value="au">Australia</option>
    <option value="es">Spain</option>
    <option value="it">Italy</option>
    <option value="nl">Netherlands</option>
    <option value="pl">Poland</option>
    <option value="tr">Turkey</option>
    <option value="sa">Saudi Arabia</option>
    <option value="ae">United Arab Emirates</option>
    <option value="hk">Hong Kong</option>
    <option value="tw">Taiwan</option>
    <option value="za">South Africa</option>
    <option value="eg">Egypt</option>
    <option value="ar">Argentina</option>
    </select>
    </div>
    <div >
    <label for="itemsPerPageSelect" class="font-medium text-gray-600 mr-2"> Hiển thị: </label>
    <select id="itemsPerPageSelect" class="border border-gray-300 rounded-md px-2 py-1 text-sm">
    <option value="5" selected> 5 </option><option value="10">10</option> <option value="20"> 20 </option><option value="50">50</option>
    </select>
    </div>
    </div>
    </div>

    <!-- Action Bar -->
    <div id="actionBar" class="hidden items-center justify-between mb-2 text-sm">
    <div class="flex items-center">
    <input type="checkbox" id ="selectAllCheckbox" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2">
    <label for="selectAllCheckbox" class="font-medium"> Chọn tất cả </label>
    </div>
    </div>

    <!-- Results -->
    <div class="results-container space-y-2" id="results">
    <p class="text-center text-gray-500 mt-8" > Nhập từ khóa để bắt đầu tìm kiếm...</p>
    </div>

    <!-- Pagination -->
      <div id="paginationControls" class=" hidden flex items-center justify-center pt-3 text-sm">
      <button class="pagination-btn px-3 py-1 border rounded-l-md bg-white hover:bg-gray-100 text-gray-400 cursor-not-allowed">Trước</button>
      <span class="px-4 py-1 border-t border-b bg-white font-bold">Trang 1</span>
      <button class="pagination-btn px-3 py-1 border rounded-r-md bg-white hover:bg-gray-100">Sau</button>
      </div>

    <!-- Footer with Import Button -->
    <div id="footerBar" class="hidden pt-4 pb-4 border-t-0.7" >
    <button id="importButton" disabled class="action-button w-full font-bold py-2 px-4 rounded-md text-white bg-gray-400 cursor-not-allowed shadow-md">Xuất icon vào Figma</button>
    </div>
    `;
};

const API_URL = process.env.VERCEL_API_BASE_URL!;
const API_KEY = process.env.FIGMA_PLUGIN_API_KEY!;

setTimeout(() => { }, 1000);

// DOM Elements
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const searchButton = document.getElementById('searchButton') as HTMLButtonElement;
const countrySelect = document.getElementById('countrySelect') as HTMLSelectElement;
const importButton = document.getElementById('importButton') as HTMLButtonElement | null;
const selectAllCheckbox = document.getElementById('selectAllCheckbox') as HTMLInputElement | null;
const itemsPerPageSelect = document.getElementById('itemsPerPageSelect') as HTMLSelectElement;
const paginationControls = document.getElementById('paginationControls') as HTMLSelectElement;
const resultsDiv = document.getElementById('results') as HTMLElement;
const actionBar = document.getElementById('actionBar') as HTMLDivElement | null;

// State
let allResults: any[] = [];
let currentPage = 1;
let selectedAppIds = new Set<string>();
let totalPages = 0;

const fetchResults = async () => {
    const term = searchInput.value.trim();
    const country = countrySelect?.value;
    const limit = parseInt(itemsPerPageSelect.value, 5);

    if (!term) {
        resultsDiv.innerHTML = `<p class="text-center text-gray-500 mt-6">Vui lòng nhập từ khóa tìm kiếm.</p>`;
        return;
    }

    resultsDiv.innerHTML = `<p class="text-center text-gray-400 mt-6">Đang tải...</p>`;
    paginationControls.innerHTML = '';
    selectedAppIds.clear();
    updateImportState();

    try {
        const res = await fetch(
            `${API_URL}/?term=${encodeURIComponent(term)}&country=${country}&limit=50`,
            {
                headers: { 'x-api-key': API_KEY },
            }
        );

        const json = await res.json();

        if (json.error) {
            resultsDiv.innerHTML = `<p class="text-center text-red-500 mt-6">${json.error}</p>`;
            return;
        }

        allResults = json.data || [];
        totalPages = Math.ceil(allResults.length / limit);
        currentPage = 1;
        renderPage(1);

        if (allResults.length === 0) {
            resultsDiv.innerHTML = `<p class="text-center text-gray-500 mt-6">Không tìm thấy kết quả nào.</p>`;
            return;
        }

        const renderPagination = document.getElementById('paginationControls');
        if (renderPagination) {
            renderPagination.classList.remove('hidden');
        }

        const footerBar = document.getElementById('footerBar');
        if (footerBar) {
            footerBar.classList.remove('hidden');
        }

        if (actionBar) {
            actionBar.classList.remove('hidden');
        }

    } catch (err) {
        resultsDiv.innerHTML = `<p class="text-center text-red-500 mt-6">Lỗi khi gọi API: ${(err as Error).message}</p>`;
    }
};

const renderPage = (page: number) => {
    const limit = parseInt(itemsPerPageSelect.value, 10);
    const start = (page - 1) * limit;
    const end = start + limit;
    const pageItems = allResults.slice(start, end);

    resultsDiv.innerHTML = '';

    if (pageItems.length === 0) {
        resultsDiv.innerHTML = `<p class="text-center text-gray-500 mt-6">Không tìm thấy kết quả nào.</p>`;
        return;
    }

    pageItems.forEach((app) => {
        const id = app.appId;
        const isSelected = selectedAppIds.has(id);

        const wrapper = document.createElement("div");
        wrapper.className = `app-card flex items-center p-2 border border-gray-300 rounded-lg bg-white cursor-pointer ${isSelected ? 'selected border-color: #3B82F6 background-color: #DBEAFE' : ''}`;

        wrapper.innerHTML = `
      <input type="checkbox" class="app-checkbox mr-3" data-id="${id}" data-url="${app.icon}" data-name="${app.title}" data-developer="${app.developer}" ${isSelected ? 'checked' : ''}>
      <img src="${app.icon}" class="w-12 h-12 rounded-lg mr-3 pointer-events-none" />
      <div class="flex-grow pointer-events-none">
        <p class="font-semibold text-sm truncate">${app.title}</p>
        <p class="text-xs text-gray-500 truncate">${app.developer}</p>
      </div>
    `;
        resultsDiv.appendChild(wrapper);
    });

    const footerBar = document.getElementById('footerBar');
    if (footerBar) {
        footerBar.classList.remove('hidden');
    }

    renderPagination();
    bindCheckboxEvents();

    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }

    updateImportState();
};


const renderPagination = () => {
    const checkboxes = document.querySelectorAll<HTMLInputElement>('.app-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
    selectedAppIds.clear();

    const limit = parseInt(itemsPerPageSelect.value, 10);
    paginationControls.innerHTML = '';

    totalPages = Math.ceil(allResults.length / limit);

    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center justify-center pt-3 text-sm';

    const prevBtn = document.createElement('button');
    prevBtn.className = `pagination-btn px-3 py-1 border rounded-l-md bg-white hover:bg-gray-100 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : ''
        }`;
    prevBtn.textContent = 'Trước';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
        }
    };

    const currentPageLabel = document.createElement('span');
    currentPageLabel.className = 'px-4 py-1 border-t border-b bg-white font-bold';
    currentPageLabel.textContent = `Trang ${currentPage}`;

    const nextBtn = document.createElement('button');
    nextBtn.className = `pagination-btn px-3 py-1 border rounded-r-md bg-white hover:bg-gray-100 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : ''
        }`;
    nextBtn.textContent = 'Sau';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPage(currentPage);
        }
    };

    wrapper.appendChild(prevBtn);
    wrapper.appendChild(currentPageLabel);
    wrapper.appendChild(nextBtn);

    paginationControls.appendChild(wrapper);
};

const bindCheckboxEvents = () => {
    const checkboxes = document.querySelectorAll<HTMLInputElement>('.app-checkbox');
    checkboxes.forEach((cb) => {
        cb.onchange = () => {
            const appId = cb.dataset.id!;
            if (cb.checked) {
                selectedAppIds.add(appId);
            } else {
                selectedAppIds.delete(appId);
            }
            updateImportState();
        };
    });
};

if (selectAllCheckbox) {
    selectAllCheckbox.onchange = () => {
        const checkboxes = document.querySelectorAll<HTMLInputElement>('.app-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = selectAllCheckbox.checked;
            const appId = cb.dataset.id!;
            if (selectAllCheckbox.checked) {
                selectedAppIds.add(appId);
            } else {
                selectedAppIds.delete(appId);
            }
        });
        updateImportState();
    };
}

const updateImportState = () => {
    if (!importButton) return;
    if (selectedAppIds.size > 0) {
        importButton.disabled = false;
        importButton.innerHTML = `Xuất (${selectedAppIds.size}) icon vào Figma`;
        importButton.classList.remove('bg-gray-400', 'cursor-not-allowed');
        importButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
    } else {
        importButton.disabled = true;
        importButton.innerHTML = `Xuất icon vào Figma`;
        importButton.classList.add('bg-gray-400', 'cursor-not-allowed');
        importButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    }
};


if (importButton) {
    importButton.onclick = () => {
        const checkboxes = document.querySelectorAll<HTMLInputElement>('.app-checkbox:checked');
        const items = Array.from(checkboxes).map(cb => ({
            url: cb.dataset.url!,
            name: cb.dataset.name!,
            developer: cb.dataset.developer!
        }));
        parent.postMessage({ pluginMessage: { type: 'import-multiple', items } }, '*');
    };
}

searchInput?.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        fetchResults();
    }
});

searchButton?.addEventListener("click", fetchResults);

