# Umbrel-like UI v8.2

Публичный sanitized-репозиторий портала для self-hosted сервисов.

## Что внутри
- HTTPS-режим
- авторизация и пользователи
- группы серверов и сервисы
- виджеты: SSD, RAM, Журнал входов, Сейчас онлайн, Домены и SSL
- Docker автопоиск
- темы и локализация RU/EN
- Telegram-уведомления и тестовая отправка

## Публичные примеры
Во всех примерах используются безопасные значения:
- IP: `11.22.33.44`
- домены: `example.com`

## Первоначальный доступ
По умолчанию пользователи не создаются автоматически.

Чтобы создать initial admin, укажи в `docker-compose.yml` или env:
- `ADMIN_BOOTSTRAP_USERNAME`
- `ADMIN_BOOTSTRAP_PASSWORD_HASH`

Hash пароля:
```bash
docker run --rm -v "$PWD":/app -w /app node:20-alpine sh -lc 'npm install >/dev/null 2>&1 && npm run hash-password -- "STRONG_PASSWORD"'
```

## Запуск
```bash
docker compose up -d --build
```

## Telegram
В настройках админа можно включить Telegram и указать:
- Bot token
- Chat ID
- Thread ID
- расписание сводок
- тестовую отправку

## Важно
Credentials в карточках сервисов удобны, но это не vault.
