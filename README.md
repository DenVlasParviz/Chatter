# Chatter

Чат-додаток на MERN-стеку з підтримкою автентифікації через Google (Clerk), асинхронної обробки подій (Inngest), інтеграцією GetStream для чатів і відеодзвінків, розгортанням на Vercel та моніторингом помилок через Sentry.

---

## Зміст
- [Огляд](#огляд)
- [Вимоги](#вимоги)
- [Змінні оточення (.env)](#змінні-оточення-env)
- [Локальна інсталяція та запуск](#локальна-інсталяція-та-запуск)
- [Скріншоти](#скріншоти)

---

## Огляд
 **Chatter** реалізує MERN-стек (MongoDB, Express, React, Node.js) та включає:
- OAuth 2.0 через **Clerk** .
- **Inngest** для асинхронної обробки подій. Відправляє дані користувача в базу данних .
- **GetStream** для роботи з чат-стрімами та відеодзвінками.
- **MongoDB** — збереження профілів користувачів.
- Деплой бекенду/функцій на **Vercel**.
- Моніторинг і логування помилок через **Sentry**.



## Вимоги
- Node.js >= 16
- npm або yarn
- MongoDB (локально або Atlas)
- Облікові записи/ключі: Clerk, GetStream, Inngest, Sentry
- Vercel 

## Змінні оточення (.env)
Приклад `server/.env`:
```
PORT=5000
MONGO_DB_URI=mongo_db_uri
MONGODB_DB_NAME=mongodb_name
NODE_ENV=node_env
JWT_SECRET=your_jwt_secret
CLERK_PUBLISHABLE_KEY=clerk_api_key_here
CLERK_SECRET_KEY=clerk_jwt_key_here
STREAM_API_KEY=stream_api_key
STREAM_API_SECRET=stream_api_secret
INGEST_EVENT_KEY=inngest_api_key
INVEST_SIGNING_KEY=inngest_signing_key
SENTRY_DSN=https://example@sentry.io/12345
VERCEL_URL=https://your-project.vercel.app
```



## Локальна інсталяція та запуск

- Встановити залежності та запустити сервер і клієнт у двох терміналах:
```bash
# сервер
cd server
npm install
npm run dev

# клієнт
cd ../client
npm install
npm run dev
```


## Скріншоти
<img width="1879" height="932" alt="RvRvpnGui_I2HiVACbwZ" src="https://github.com/user-attachments/assets/99e29851-47c9-4548-99d9-ef0846c8b01f" />
<img width="1855" height="924" alt="firefox_Dx5Y3SZzXx" src="https://github.com/user-attachments/assets/8434c1e7-0e60-4be9-b72a-94ef44900c1a" />
<img width="1553" height="920" alt="firefox_GJYYMLlyE7" src="https://github.com/user-attachments/assets/10bded07-a26d-4c6d-a64d-ca87d50c7e91" />
<img width="1912" height="907" alt="firefox_L0iD79xXlh" src="https://github.com/user-attachments/assets/4a93454b-7e92-429e-943f-3fd6aa118460" />

