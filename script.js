const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby-JdSwP-V3jlo0pNvB0ENZBcdu4ecb_1O3D0nv77qOhs9kUVTuIwu6oH9i6zeuN0_1Zw/exec";
let inventory = [];
let cart = {};

// Google Sheet မှ ဒေတာယူခြင်း
async function loadData() {
    try {
        const response = await fetch(WEB_APP_URL);
        inventory = await response.json();
        renderItems(inventory);
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('itemList').innerHTML = "ဒေတာယူ၍ မရနိုင်ပါ။";
    }
}

// ပစ္စည်းများကို မျက်နှာပြင်ပေါ်ပြခြင်း
function renderItems(items) {
    const listDiv = document.getElementById('itemList');
    listDiv.innerHTML = items.map(item => `
        <div class="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center border-l-4 border-blue-500 item-card">
            <div class="flex-1">
                <div class="font-bold text-gray-800">${item[1]}</div>
                <div class="text-xs text-gray-500">${item[2]} | လက်ကျန်: ${item[4]}</div>
                <div class="text-blue-600 font-bold">${item[3].toLocaleString()} MMK</div>
            </div>
            <div class="flex items-center space-x-3">
                <button onclick="updateCart('${item[0]}', -1, ${item[3]})" class="bg-gray-200 w-8 h-8 rounded-full font-bold">-</button>
                <span id="qty-${item[0]}" class="font-bold w-6 text-center">0</span>
                <button onclick="updateCart('${item[0]}', 1, ${item[3]})" class="bg-blue-100 text-blue-600 w-8 h-8 rounded-full font-bold">+</button>
            </div>
        </div>
    `).join('');
}

// ခြင်းထဲသို့ ပစ္စည်းထည့်ခြင်း/နှုတ်ခြင်း
function updateCart(id, change, price) {
    if (!cart[id]) cart[id] = { qty: 0, price: price };
    
    cart[id].qty += change;
    if (cart[id].qty < 0) cart[id].qty = 0;

    document.getElementById(`qty-${id}`).innerText = cart[id].qty;
    calculateTotal();
}

// စုစုပေါင်း ကျသင့်ငွေတွက်ချက်ခြင်း
function calculateTotal() {
    let total = 0;
    for (let id in cart) {
        total += cart[id].qty * cart[id].price;
    }
    document.getElementById('totalAmount').innerText = total.toLocaleString() + " MMK";
}

// ရှာဖွေရေးလုပ်ဆောင်ချက်
document.getElementById('searchInput').addEventListener('keyup', (e) => {
    let val = e.target.value.toLowerCase();
    let filtered = inventory.filter(item => item[1].toLowerCase().includes(val));
    renderItems(filtered);
    // ပြန်ပေါ်လာသော ပစ္စည်းများအတွက် လက်ရှိ ရွေးထားသော အရေအတွက်များကို ပြန်ပြရန်
    for (let id in cart) {
        let el = document.getElementById(`qty-${id}`);
        if (el) el.innerText = cart[id].qty;
    }
});

// ရောင်းချမှု အတည်ပြုခြင်း
async function checkout() {
    const finalCart = Object.keys(cart)
        .filter(id => cart[id].qty > 0)
        .map(id => ({ id: id, qty: cart[id].qty }));

    if (finalCart.length === 0) return alert("ပစ္စည်း အနည်းဆုံး တစ်မျိုး ရွေးပေးပါ");

    const btn = document.getElementById('checkoutBtn');
    btn.disabled = true;
    btn.innerText = "သိမ်းဆည်းနေပါသည်...";

    try {
        await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({ cart: finalCart })
        });
        alert("ရောင်းချမှု အောင်မြင်ပါသည်။");
        location.reload(); 
    } catch (error) {
        alert("အမှားအယွင်း ရှိနေပါသည်။");
        btn.disabled = false;
        btn.innerText = "ရောင်းမည် (Checkout)";
    }
}

loadData();
