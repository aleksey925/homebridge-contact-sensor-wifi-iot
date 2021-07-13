homebridge-contact-sensor-wifi-iot
==================================

Плагин позволяющий подключить к homebridge контактные сенсоры (датчики открытия дверей, окон и т д) работающие под 
управляем [wifi-iot](https://wifi-iot.com). Для возможности получать информацию от сенсора, необходимо собирать 
прошивку с поддержкой расширения `GET JSON`.

## Установка

```
npm install -g git+https://github.com/aleksey925/homebridge-contact-sensor-wifi-iot.git
```

## Конфигурирование

Пример настроек, которые необходимо добавить в конфиг homebridge:

```json
{
    "accessory": "WiFiIoTContactSensor",
    "name": "Ворота гаража",
    "gpio": 12,
    "statusUrl": "http://<ip-address-sensor>/readjson",
    "login": <login>,
    "password": <password>,
    "pollInterval": 500
}
```

Описание параметров конфига:

- login - логин для доступа к сенсору. Необязательный параметр, необходимо указывать если включена опция `Full Security`

- password - пароль для доступа к сенсору. Необязательный параметр, необходимо указывать если включена опция `Full Security`
