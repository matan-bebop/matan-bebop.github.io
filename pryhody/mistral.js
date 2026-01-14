rank_schema = {
  "type": "json_schema",
  "json_schema": { "schema": { "properties": {
    "команди": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "команда": {"type": "string"},
          "оцінка": {"type": "integer"}
        },
        "required": ["команда", "оцінка"]
      }
    }
  }},
  "name": "rank_schema",
  "strict": true
  }
}

async function interpret(prompt, commands, key) {
  const prompt_string = JSON.stringify({
    "model": "ministral-8b-latest",
    "messages": [
      {"role": "system", "content": "Оціни від 0.00 до 1.00, наскільки підходять команди до запиту користувача."},
      {"role": "user", "content": "Запит: " + prompt},
      {"role": "user", "content": "Команди: " + commands} 
    ],
    "response_format": rank_schema,
    "max_tokens": 256,
    "temperature": 0
  })
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": "Bearer " + key,
    },
    body: prompt_string 
  });

  const response_json = await response.json();
  console.log(response_json.choices[0].message.content)
}
