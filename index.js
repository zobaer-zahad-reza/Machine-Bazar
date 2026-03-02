document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const bookFormat = document.getElementById("bookFormat");
  const shippingSection = document.getElementById("shippingSection");
  const quantitySection = document.getElementById("quantitySection");
  const codBtn = document.getElementById("codBtn");
  const shippingRadios = document.querySelectorAll('input[name="shipping"]');

  const finalTotalDisplays = document.querySelectorAll(".finalTotalDisplay");
  const subTotalDisplay = document.getElementById("subTotalDisplay");
  const itemPriceDisplay = document.getElementById("itemPriceDisplay");

  const plusBtn = document.getElementById("plusBtn");
  const minusBtn = document.getElementById("minusBtn");
  const quantityEl = document.getElementById("quantity");

  const submitBtn = document.getElementById("submitOrderBtn");

  // Payment inputs (optional for sheet tracking)
  const bkashNumber = document.getElementById("bkashNumber");
  const bkashTrx = document.getElementById("bkashTrx");
  const nagadNumber = document.getElementById("nagadNumber");
  const nagadTrx = document.getElementById("nagadTrx");

  // Base Price
  const basePrice = 1000;

  // 1. Order Calculation Logic
  function updateOrderDetails() {
    let currentQty = parseInt(quantityEl.innerText);
    let subTotal = 0;
    let shippingCost = 0;
    let finalTotal = 0;

    if (bookFormat.value === "PDF") {
      shippingSection.classList.add("hidden");
      quantitySection.classList.add("hidden");
      codBtn.classList.add("hidden");
      subTotal = basePrice;
    } else {
      shippingSection.classList.remove("hidden");
      quantitySection.classList.remove("hidden");
      codBtn.classList.remove("hidden");
      subTotal = basePrice * currentQty;

      shippingRadios.forEach((radio) => {
        if (radio.checked) {
          shippingCost = parseInt(radio.value);
        }
      });
    }

    finalTotal = subTotal + shippingCost;

    itemPriceDisplay.innerText = subTotal.toFixed(2);
    subTotalDisplay.innerText = subTotal.toFixed(2);
    finalTotalDisplays.forEach((display) => {
      display.innerText = finalTotal.toFixed(2);
    });
  }

  // Event Listeners for + / -
  plusBtn.addEventListener("click", () => {
    let currentQty = parseInt(quantityEl.innerText);
    quantityEl.innerText = currentQty + 1;
    updateOrderDetails();
  });

  minusBtn.addEventListener("click", () => {
    let currentQty = parseInt(quantityEl.innerText);
    if (currentQty > 1) {
      quantityEl.innerText = currentQty - 1;
      updateOrderDetails();
    }
  });

  bookFormat.addEventListener("change", updateOrderDetails);
  shippingRadios.forEach((radio) =>
    radio.addEventListener("change", updateOrderDetails),
  );

  updateOrderDetails();

  // 2. Form Submission Logic to Google Sheets
  submitBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Get input values
    const name = document.getElementById("customerName").value.trim();
    const address = document.getElementById("customerAddress").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const notes = document.getElementById("orderNotes").value.trim();
    const format = bookFormat.value;
    const qty = quantityEl.innerText;

    // Validation
    if (!name || !address || !phone) {
      alert(
        "অনুগ্রহ করে আপনার নাম, ঠিকানা এবং ফোন নাম্বার সঠিকভাবে পূরণ করুন।",
      );
      return;
    }

    // Prepare data
    let shippingArea = "N/A";
    if (format !== "PDF") {
      const selectedShipping = document.querySelector(
        'input[name="shipping"]:checked',
      );
      if (selectedShipping)
        shippingArea = selectedShipping.getAttribute("data-area");
    }

    const totalAmount = document.querySelector(".finalTotalDisplay").innerText;

    // BD Time formatting replacing slashes with hyphens
    const dateOptions = {
      timeZone: "Asia/Dhaka",
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    const currentDate = new Date()
      .toLocaleString("en-GB", dateOptions)
      .replace(/\//g, "-");

    // Format Data for Sheet
    const formData = new FormData();
    formData.append("Date", currentDate);
    formData.append("Name", name);
    formData.append("Address", address);
    formData.append("Phone", phone);
    formData.append("Format", format);
    formData.append("Quantity", format === "PDF" ? "1" : qty);
    formData.append("ShippingArea", shippingArea);
    formData.append("TotalPrice", totalAmount + " BDT");
    formData.append("Notes", notes);

    // Payment Data
    formData.append("bKashNumber", bkashNumber.value.trim());
    formData.append("bKashTrx", bkashTrx.value.trim());
    formData.append("NagadNumber", nagadNumber.value.trim());
    formData.append("NagadTrx", nagadTrx.value.trim());

    // ⚠️ REPLACE THIS URL WITH YOUR GOOGLE APPS SCRIPT WEB APP URL ⚠️
    const scriptURL =
      "https://script.google.com/macros/s/AKfycbwniLIXhWrcuT4HL8QpfYZnsrZbhLc8lu_zdvvZkRMiPmGBTm2Nk_pc480wARwENGwQ/exec";

    // UI Loading state
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = "প্রসেসিং হচ্ছে... অপেক্ষা করুন";
    submitBtn.disabled = true;
    submitBtn.classList.add("opacity-70", "cursor-not-allowed");

    // Send Data via POST request
    fetch(scriptURL, { method: "POST", body: formData })
      .then((response) => {
        alert("ধন্যবাদ! আপনার অর্ডারটি সফলভাবে কনফার্ম হয়েছে।");

        // Reset main form & modal inputs
        document.getElementById("customerName").value = "";
        document.getElementById("customerAddress").value = "";
        document.getElementById("customerPhone").value = "";
        document.getElementById("orderNotes").value = "";
        bkashNumber.value = "";
        bkashTrx.value = "";
        nagadNumber.value = "";
        nagadTrx.value = "";

        // Reset button UI
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        submitBtn.classList.remove("opacity-70", "cursor-not-allowed");
      })
      .catch((error) => {
        console.error("Error!", error.message);
        alert("দুঃখিত, কোনো সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        submitBtn.classList.remove("opacity-70", "cursor-not-allowed");
      });
  });
});
