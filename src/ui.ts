console.log("[UI] UI script loaded");
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
    <input type="text" id = "searchInput" class="flex-grow border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder = "Nhập tên ứng dụng..." >
    <button id="searchButton" class="bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center" >
    <svg xmlns="http://www.w3.org/2000/svg" width = "16" height = "16" fill = "currentColor" class="bi bi-search" viewBox = "0 0 16 16" > <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" /> </svg>
    </button>
    </div>

    <!--Options -->
    <div class="mb-3 text-sm" >
    <div class="flex items-center justify-between" >
    <div> <label for= "countrySelect" class= "font-medium text-gray-600 mr-2"> Quốc gia: </label>
    <select id = "countrySelect" class="border border-gray-300 rounded-md px-2 py-1 text-sm">
    <option value="us"> US </option><option value="vn">Vietnam</option> <option value="gb" >UK</option><option value="jp">Japan</option>
    </select>
    </div>
    <div >
    <label for= "itemsPerPageSelect" class= "font-medium text-gray-600 mr-2"> Hiển thị: </label>
    <select id = "itemsPerPageSelect" class="border border-gray-300 rounded-md px-2 py-1 text-sm">
    <option value="5"> 5 </option><option value="10" selected>10</option> <option value="20"> 20 </option><option value="50">50</option>
    </select>
    </div>
    </div>
    </div>

    <!--Action Bar-- >
    <div id="actionBar" class="hidden items-center justify-between mb-2 text-sm">
    <div class="flex items-center">
    <input type="checkbox" id = "selectAllCheckbox" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2">
    <label for= "selectAllCheckbox" class= "font-medium"> Chọn tất cả </label>
    </div>
    </div>

    <!--Results -->
    <div class="results-container" id = "results">
    <p class="text-center text-gray-500 mt-8" > Nhập từ khóa để bắt đầu tìm kiếm...</p>
    <br>
    <p class="text-center text-gray-500 mt-8" > Một món đồ chơi của hungnd </p>
    <br>
    <img id="preview" class="w-[250px] h-64 mx-auto flex item-center" alt = "" />
    </div>

    <!--Pagination -->
    <div id="paginationControls" class="flex items-center justify-center pt-3 text-sm" > </div>

    <!--Footer with Import Button-- >
    <div id="footerBar" class="hidden pt-3 border-t" >
    <button id="importButton" disabled class="action-button w-full font-bold py-2 px-4 rounded-md text-white bg-gray-400 cursor-not-allowed">Xuất icon vào Figma</button>
    </div>

    <!--Loading Spinner-- >
    <div id="loading" class="hidden absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
    <div class="loader"> </div>
    </div>
    `;
};

const API_URL = process.env.VERCEL_API_BASE_URL!;
const API_KEY = process.env.FIGMA_PLUGIN_API_KEY!;

// DOM Elements
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const searchButton = document.getElementById('searchButton')!;
const resultsDiv = document.getElementById('results')!;
const countrySelect = document.getElementById('countrySelect') as HTMLSelectElement;
const itemsPerPageSelect = document.getElementById('itemsPerPageSelect') as HTMLSelectElement;
const paginationControls = document.getElementById('paginationControls') as HTMLSelectElement;
const selectAllCheckbox = document.getElementById('selectAllCheckbox') as HTMLInputElement;
const importButton = document.getElementById('importButton') as HTMLButtonElement;

// State
let allResults: any[] = [];
let currentPage = 1;
let selectedAppIds = new Set<string>();

const fetchResults = async () => {
    const term = searchInput.value.trim();
    const country = countrySelect.value;
    const limit = parseInt(itemsPerPageSelect.value, 10);

    if (!term) {
        resultsDiv.innerHTML = `<p class="text-center text-gray-500 mt-6">Vui lòng nhập từ khóa tìm kiếm.</p>`;
        return;
    }

    resultsDiv.innerHTML = `<p class="text-center text-gray-400 mt-6">Đang tải...</p>`;
    paginationControls.innerHTML = '';
    selectedAppIds.clear();
    updateImportState();

    try {
        const res = await fetch(`${API_URL}/?term=${encodeURIComponent(term)}&country=${country}&limit=${limit}`, {
            headers: { 'x-api-key': API_KEY }
        });
        const json = await res.json();

        if (json.error) {
            resultsDiv.innerHTML = `<p class="text-center text-red-500 mt-6">${json.error}</p>`;
            return;
        }

        allResults = json.data || [];
        renderPage(1);
    } catch (err) {
        resultsDiv.innerHTML = `<p class="text-center text-red-500 mt-6">Lỗi khi gọi API: ${(err as Error).message}</p>`;
    }
};

const renderPage = (page: number) => {
    currentPage = page;
    const perPage = parseInt(itemsPerPageSelect.value, 10);
    const start = (page - 1) * perPage;
    const apps = allResults.slice(start, start + perPage);

    resultsDiv.innerHTML = '';
    if (apps.length === 0) {
        resultsDiv.innerHTML = `<p class="text-center text-gray-500 mt-6">Không tìm thấy kết quả nào.</p>`;
        return;
    }

    apps.forEach((app) => {
        const id = app.appId;
        const isSelected = selectedAppIds.has(id);

        const wrapper = document.createElement("div");
        wrapper.className = `app-card flex items-center p-2 border rounded-lg bg-white cursor-pointer ${isSelected ? 'selected' : ''}`;
        wrapper.innerHTML = `
      <input type="checkbox" class="app-checkbox mr-3" data-id="${id}" data-url="${app.icon}" data-name="${app.title}" data-developer="${app.developer}" ${isSelected ? 'checked' : ''}>
      <img src="${app.icon}" class="w-12 h-12 rounded-lg mr-3" />
      <div class="flex-grow">
        <p class="font-semibold text-sm truncate">${app.title}</p>
        <p class="text-xs text-gray-500 truncate">${app.developer}</p>
      </div>
    `;
        resultsDiv.appendChild(wrapper);
    });

    renderPagination();
    bindCheckboxEvents();
    selectAllCheckbox.checked = false;
    updateImportState();
};

const renderPagination = () => {
    const perPage = parseInt(itemsPerPageSelect.value, 10);
    const totalPages = Math.ceil(allResults.length / perPage);

    paginationControls.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = `${i}`;
        btn.className = `px-2 py-1 border rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-white'}`;
        btn.onclick = () => renderPage(i);
        paginationControls.appendChild(btn);
    }
};

const bindCheckboxEvents = () => {
    const checkboxes = document.querySelectorAll<HTMLInputElement>('.app-checkbox');
    checkboxes.forEach(cb => {
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

const updateImportState = () => {
    const isEnabled = selectedAppIds.size > 0;
    importButton.disabled = !isEnabled;
    importButton.className = isEnabled
        ? "bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-semibold hover:bg-blue-700"
        : "bg-gray-400 text-white rounded-md px-4 py-2 text-sm font-semibold cursor-not-allowed";
};

importButton.onclick = () => {
    const checkboxes = document.querySelectorAll<HTMLInputElement>('.app-checkbox:checked');
    const items = Array.from(checkboxes).map(cb => ({
        url: cb.dataset.url!,
        name: cb.dataset.name!,
        developer: cb.dataset.developer!
    }));
    parent.postMessage({ pluginMessage: { type: 'import-multiple', items } }, '*');
};

searchButton.onclick = fetchResults;
searchInput.onkeyup = (e) => { if (e.key === 'Enter') fetchResults(); };