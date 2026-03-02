const plusBtn = document.getElementById("plusBtn");
const minusBtn = document.getElementById("minusBtn");
const quantity = document.getElementById("quantity");
const price = document.getElementById("price");

const basePrice = 1000;

plusBtn.addEventListener("click", function () {
  let current = parseInt(quantity.innerText);
  current = current + 1;
  quantity.innerText = current;

  const total = basePrice * current;
  price.innerText = total.toFixed(1) + "৳";
});

minusBtn.addEventListener("click", function () {
  let current = parseInt(quantity.innerText);

  if (current > 1) {
    current = current - 1;
    quantity.innerText = current;

    const total = basePrice * current;
    price.innerText = total.toFixed(1) + "৳";
  }
});
