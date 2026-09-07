sed -i '/price: 435000,/a \    priceHistory: [\n      { date: "2026-06-01", price: 460000, event: "Listed" },\n      { date: "2026-07-15", price: 450000, event: "Price Drop" },\n      { date: "2026-08-10", price: 435000, event: "Price Drop" }\n    ],' src/data/initialData.ts

sed -i '/price: 399000,/a \    priceHistory: [\n      { date: "2026-07-01", price: 399000, event: "Listed" }\n    ],' src/data/initialData.ts
