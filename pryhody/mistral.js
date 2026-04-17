async function ask_mistral(messages, answer_schema, key) {
  const prompt_string = JSON.stringify({
    "model": "ministral-8b-latest",
    "messages": messages,
    "response_format": answer_schema,
    "max_tokens": 65536,
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


function rank_schema(commands)
{
  const r_sch = {
    "type": "json_schema",
    "json_schema": { "schema": {
       "type": "object",
       "properties": {},
       "required": []
    },
    "name": "rank_schema",
    "strict": true
  }}

  let kk = r_sch.json_schema.schema.properties,
      rr = r_sch.json_schema.schema.required

  commands.forEach((s) => { kk[s] = {"type": "integer"}; rr.push(s)})

  return r_sch
}

async function rank(prompt, commands, key) {
  const messages = [
    {"role": "system", "content": "Оціни від 0 до 100, наскільки підходять команди до запиту користувача. Надавай перевагу найбільш повним командам, які найкраще передають інформацію з запиту:\n- Надавай перевагу командам з тими ж прислівниками і з такими ж відмінками предмету, як у запиті\n- Врахуй, що всієї інформації як у запиті, в командах може і не бути\n- Неповні команди містять символ '…' в кінці, їх оцінюй *так само високо* як коли б вони були б повними\n- Команди не потрібно продовжувати у відповіді!\n- Команди, що не містять всієї інформації з запиту, а водночас і не мають символу '…' в кінці–теж непоганий вибір, але оцінюй їх понижче\n- **Ніколи** не додавай нових властивостей до JSON Scheme, яка задає формат відповіді!"},
    {"role": "user", "content": "Запит: " + prompt}
  ]
  const resp = await ask_mistral(messages, rank_schema(commands), key)
  // SWI-Prolog 9 не вміє в кирилицю в назвах ключів в JSON, тому
  const ret = Object.keys(resp).map((k) => {const d = {};
                                       d.komanda = k; d.ocinka = resp[k];
                                       return d})
  return ret
}



guess_schema = {
  "type": "json_schema",
  "json_schema": { "schema": { "properties": {
    "varianty": { "type": "array", "items": {
        "type": "object",
        "properties": {
          "komanda": {"type": "string"},
          "ocinka": {"type": "integer"}
        },
        "required": ["komanda", "ocinka"]
      }
    }
  }},
  "name": "guess_schema",
  "strict": true
  }
}

async function guess(prompt, key)
{
 const messages = [
    {"role": "system", "content": "Ти досконально знаєш українську мову і розумієш контекст парсерних ігор. Дай декілька варіантів команди для парсерного інтерфейсу українською, що найліпше відповідає запиту.\n\n# Вказівки\n- Команда українською мовою\n -_Без_ ком, _без_ дужок і _без_ крапки в кінці\n- Без дієприслівників (_без_ 'швидко' тощо)\n- Дієслово в інфінитиві\n- Лише один предмет\n -Уточнення предмету, якщо є в запиті, лише після іменника (як-то 'шапка Івана', але _не_ 'Іванова шапка')\n- Не вигадуй свої дії, предмети чи уточнення предмету! **Команди мають містити лише інформацію з запиту** -Оціни від 0 до 100, наскільки підходить команда до запиту."},
    {"role": "user", "content": "Запит: " + prompt}
  ]
  return await ask_mistral(messages, guess_schema, key)
}


is_actionless_schema = {
  "type": "json_schema",
  "json_schema": { "schema": {
    "type": "object",
    "properties": {
      "думки": {"type": "string"},
      "is_real_action": { "type": "integer"}
    },
    "required": ["думки", "is_real_action"]
  },
  "name": "is_actionless_schema",
  "strict": true
}}

async function is_actionless(part, prompt, key) {
  const messages = [
    {"role": "system", "content": "Ти відчуваєш всі нюанси природної мови і допомогаєш виявити команди гравця у текстовій грі. Враховуючи контекст всього запиту гравця, оціни від 0 до 100, чи містить надана частина опис дій, що їх хоче виконати гравець.\n\n#Інструкції\n\n- Високо оцінюй всі дії, що спрямовані на зовнішній світ у грі\n- Навіть якщо дія не містить обʼєкту, як-то ʼприслухайсяʼ чи 'оглянися', це все одно може бути дія у грі\n- Оцінюй низько, якщо частина лише закликає звернути увагу на наступну частину запиту гравця\n-Наприклад, 'слухай, давай стрибатиʼ містить частину 'слухай', яка не описує, що саме треба зробити у грі\n -Оцінюй лише _надану частину_, без врахування закликів у подальшому запиті, хоч і в контексті всього запиту"},
    {"role": "user", "content": "Надана частина: " + part},
    {"role": "user", "content": "Весь запит: " + prompt}
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
    {"role": "system", "content": "Розбий запит користувача на частини, кожна з яких описує окрему дію. Не розділяй вже виділену дію на дієслово і предмети. Не виділяй частини без дієслова. Не виділяй і не викидай уточнення предмету після слів 'що', 'який', 'котрий' тощо. Не перефразовуй."},
    {"role": "user", "content": "Запит: " + prompt}
  ]
  return await ask_mistral(messages, split_schema, key)
}
