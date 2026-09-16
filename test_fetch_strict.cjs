async function test() {
  const url = "https://cfmtg.com/mford/";
  console.log("Fetching URL...");
  try {
    const fetchRes = await fetch(url, { signal: AbortSignal.timeout(8000) });
    console.log("Fetch OK:", fetchRes.ok, fetchRes.statusText);
    const text = await fetchRes.text();
    console.log("Got text length:", text.length);
  } catch (e) {
    console.log("Fetch failed:", e.message);
  }
}
test();
