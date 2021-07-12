homebridge-contact-sensor-wifi-iot
==================================

Плагин для homebridge позволяющий работать с контактными сенсорами (сенсоры открытия дверей и т д) работающими под 
управляем [wifi-iot](https://wifi-iot.com). Для возможности получать информацию от сенсора, необходимо собирать прошивку
с поддержкой `GET JSON`.

## Установка

```
npm install -g git+https://github.com/aleksey925/homebridge-contact-sensor-wifi-iot.git
```

## Конфигурирование

Пример настроек, которые необходимо добавить в конфиг homebrige.

```json
{
    "accessory": "WiFiIoTContactSensor",
    "name": "Гараж один",
    "gpio": 12,
    "statusUrl": "http://<ip-address-sensor>/readjson",
    "login": <login>,
    "password": <password>,
    "pollInterval": 500
}
```
