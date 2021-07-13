const http = require('http');

var Service, Characteristic, ContactState;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    ContactState = homebridge.hap.Characteristic.ContactSensorState;
    homebridge.registerAccessory("homebridge-contact-sensor-wifi-iot", "WiFiIoTContactSensor", ContactSensorAccessory);
};

function ContactSensorAccessory(log, config) {
    this.log = log;
    this.name = config.name;
    this.pollInterval = config.pollInterval;
    this.gpio = config.gpio || null;
    this.statusUrl = config.statusUrl || null;
    this.login = config.login || null;
    this.password = config.password || null;

    // Значение GPIO, которое используется если не удалось от контроллера получить состояние датчика. При установке
    // этого такого статуса в приложении Дом будет отображаться, что устройство недоступно.
    this.unknownGpioState = null;
    this.baseAuthHeader = null;
    this.isClosed = true;

    if (this.login && this.password) {
        this.baseAuthHeader = 'Basic ' + Buffer.from(this.login + ':' + this.password).toString('base64');
    }

    if (this.statusUrl == null) {
        throw new Error("You have to provide 'statusUrl' to get device information");
    }

    if (this.gpio == null) {
        throw new Error("You have to provide 'gpio' to get device information");
    }

    setTimeout(this.monitorContactState.bind(this), this.pollInterval);

    this.service = new Service.ContactSensor(this.name);
    this.serviceInfo = new Service.AccessoryInformation();
    this.serviceInfo
        .setCharacteristic(Characteristic.Manufacturer, "alex925")
        .setCharacteristic(Characteristic.Model, "wifi-iot-contact-sensor")
        .setCharacteristic(Characteristic.SerialNumber, "0.0.1");

    this.service
        .getCharacteristic(Characteristic.ContactSensorState)
        .on('get', this.getContactSensorState.bind(this));

    this.service
        .getCharacteristic(Characteristic.Name)
        .on('get', this.getName.bind(this));
}

ContactSensorAccessory.prototype = {

    monitorContactState: function () {
        // Запускается каждые x раз в секунду и проверяет текущий статус сенсора
        this.fetchStatus((state) => {
            if (this.isClosed != state) {
                this.isClosed = state;
                this.service.getCharacteristic(Characteristic.ContactSensorState).setValue(this.isClosed);
            }
            setTimeout(this.monitorContactState.bind(this), this.pollInterval);
        })
    },

    fetchStatus: function (callback) {
        var reqOptions = {
            headers: {
                "Authorization": this.baseAuthHeader
            }
        }

        http.get(this.statusUrl, reqOptions, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                if (resp.statusCode == 200) {
                    var gpioStatus = this.unknownGpioState;

                    try {
                        gpioStatus = JSON.parse(data).gpio[this.gpio]
                    } catch (exception) {
                        this.log("Exception during parsing response from the sensor.\n", exception.stack);
                    }

                    callback(gpioStatus);
                    return
                } else if (resp.statusCode == 401) {
                    this.log("You cannot get sensor status. Login and password are not correct.");
                    callback(this.unknownGpioState);
                    return;
                }

                this.log(
                    "Unexpected http status received during sensor status request. statusCode: %s", resp.statusCode
                );
                callback(this.unknownGpioState);

            });
        }).on("error", (err) => {
            this.log("Error in trying to get sensor status. Error message: ", err.message);
            callback(this.unknownGpioState);
        });
    },

    getContactSensorState: function (callback) {
        this.fetchStatus((state) => {
            this.isClosed = state;
            this.log.debug("Current contact sensor state: ", this.isClosed);
            callback(null, this.isClosed);
        });
    },

    getName: function (callback) {
        callback(null, this.name);
    },

    identify: function (callback) {
        callback(null);
    },

    getServices: function () {
        return [this.serviceInfo, this.service];
    }
};
