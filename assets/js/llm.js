export async function sendPrompt(message) {
  const response = await fetch("/api/llm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: message })
  });

  const data = await response.json();
  return data.output;
}
