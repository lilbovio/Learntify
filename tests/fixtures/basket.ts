export const basketSolution = `function basketTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i = i + 1) {
    total = total + items[i].priceCents * items[i].quantity;
  }
  return total;
}`;
