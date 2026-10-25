 // Admin Operational Module Engine
const publishForm = document.getElementById('admin-publish-form');
const listContainer = document.getElementById('admin-items-list');
const logoutBtn = document.getElementById('logout-action');

// 1. Session verification protection rule
async function enforceSecurity() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.email !== 'cedrickkayiranga354@gmail.com') {
        alert("Access Denied: Administrative Clearance Required.");
        window.location.href = "login.html";
    }
}

// 2. Fetch and render items in the management dashboard
async function fetchAdminContentList() {
    if (!listContainer) return;
    listContainer.innerHTML = `<p class="text-gray-500 font-mono text-xs text-center py-4">Refreshing active entries...</p>`;

    try {
        const { data: records, error } = await supabase
            .from('ckavox_content')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!records || records.length === 0) {
            listContainer.innerHTML = `<p class="text-gray-500 font-mono text-xs text-center py-6 uppercase">No custom entries found. Slideshows running on fallback assets.</p>`;
            return;
        }

        listContainer.innerHTML = '';
        records.forEach(item => {
            const itemBox = document.createElement('div');
            itemBox.className = "bg-[#0b0c10] p-4 rounded-xl border border-gray-800 flex items-center justify-between gap-4";
            itemBox.innerHTML = `
                <div class="flex items-center gap-3 overflow-hidden">
                    <img src="${item.image_url}" class="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-800" alt="thumb">
                    <div class="overflow-hidden">
                        <h4 class="text-sm font-bold uppercase tracking-wide truncate">${item.title}</h4>
                        <p class="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">Section: <span class="text-[#00ffff]">${item.category}</span></p>
                    </div>
                </div>
                <button onclick="deletePostRecord('${item.id}')" class="text-xs bg-red-900/40 border border-red-700/50 hover:bg-red-600 text-red-200 px-3 py-1.5 rounded-lg uppercase tracking-wider font-bold transition">
                    Remove
                </button>
            `;
            listContainer.appendChild(itemBox);
        });

    } catch (err) {
        listContainer.innerHTML = `<p class="text-red-400 font-mono text-xs text-center">Failed to gather active records: ${err.message}</p>`;
    }
}

// 3. Handle publishing new entries to the database
if (publishForm) {
    publishForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const category = document.getElementById('post-category').value;
        const title = document.getElementById('post-title').value.trim();
        const image_url = document.getElementById('post-image').value.trim();

        try {
            const { error } = await supabase
                .from('ckavox_content')
                .insert([{ category, title, image_url }]);

            if (error) throw error;

            alert("Successfully uploaded to slideshow array!");
            publishForm.reset();
            fetchAdminContentList();

        } catch (err) {
            alert("Publish operation failed: " + err.message);
        }
    });
}

// 4. Delete existing entries from the database
window.deletePostRecord = async function(id) {
    if (!confirm("Are you sure you want to remove this image from the slideshow?")) return;

    try {
        const { error } = await supabase
            .from('ckavox_content')
            .delete()
            .eq('id', id);

        if (error) throw error;

        alert("Record permanently erased.");
        fetchAdminContentList();
    } catch (err) {
        alert("Delete operational failure: " + err.message);
    }
};

// 5. Manage session signouts
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = "login.html";
    });
}

// Hooks
document.addEventListener('DOMContentLoaded', async () => {
    await enforceSecurity();
    fetchAdminContentList();
});
