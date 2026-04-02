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
  return JSON.parse(response_json.choices[0].message.content)
}


rank_schema = {
  "type": "json_schema",
  "json_schema": { "schema": { "properties": {
    "komandy": { "type": "array", "items": {
        "type": "object",
        "properties": {
          "komanda": {"type": "string"},
          "ocinka": {"type": "integer"}
        },
        "required": ["komanda", "ocinka"]
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
  return await ask_mistral(messages, rank_schema, key)
}


is_actionless_schema = {
  "type": "json_schema",
  "json_schema": { "schema": {
    "type": "object",
    "properties": { "chy_dija": { "type": "integer"} },
    "required": ["chy_dija"]
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
  return await ask_mistral(messages, is_actionless_schema, key)
}


split_schema = {
  "type": "json_schema",
  "json_schema": { "schema": { "properties": {
    "chastyny": { "type": "array", "items": {
        "type": "object",
        "properties": {
          "dija": {"type": "string"},
        },
        "required": ["dija"]
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
