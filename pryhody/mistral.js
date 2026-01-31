async function ask_mistral(messages, answer_schema, key) {
  const prompt_string = JSON.stringify({
    "model": "ministral-8b-latest",
    "messages": messages,
    "response_format": answer_schema,
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
  return response_json.choices[0].message.content
}


rank_schema = {
  "type": "json_schema",
  "json_schema": { "schema": { "properties": {
    "команди": { "type": "array", "items": {
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
  const messages = [
    {"role": "system", "content": "Оціни від 0 до 100, наскільки підходять команди до запиту користувача."},
    {"role": "user", "content": "Запит: " + prompt},
    {"role": "user", "content": "Команди: " + commands} 
  ]
  answer = await ask_mistral(messages, rank_schema, key)
  console.log(answer)
}


is_actionless_schema = {
  "type": "json_schema",
  "json_schema": { "schema": {
    "type": "object",
    "properties": { "чи_дія": { "type": "integer"} },
    "required": ["чи_дія"]
  },
  "name": "is_actionless_schema",
  "strict": true
}}

async function is_actionless(part, prompt, key) {
  const messages = [
    {"role": "system", "content": "Оціни від 0 до 100, чи містить частина запиту реальний заклик до дії, чи є просто риторичною фігурою мовлення."},
    {"role": "user", "content": "Частина: " + part},
    {"role": "user", "content": "Запит: " + prompt}
  ]
  answer = await ask_mistral(messages, is_actionless_schema, key)
  console.log(answer)
}


split_schema = {
  "type": "json_schema",
  "json_schema": { "schema": { "properties": {
    "частини": { "type": "array", "items": {
        "type": "object",
        "properties": {
          "дія": {"type": "string"},
        },
        "required": ["дія"]
      }
    }
  }},
  "name": "split_schema",
  "strict": true
  }
}

async function split(prompt, key) {
  const messages = [
    {"role": "system", "content": "Розбий запит користувача на частини, кожна з яких описує окрему дію. Не розділяй вже виділену дію на дієслово і предмети. Не перефразовуй."},
    {"role": "user", "content": "Запит: " + prompt}
  ]
  return await ask_mistral(messages, split_schema, key)
}
