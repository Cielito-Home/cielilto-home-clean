const path = require('path');

exports.getServicesPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/services.html'));
};

exports.getServicesList = (req, res) => {
    const services = [
        {
            id: 1,
            title: "Limpieza Residencial"
        }
    ];
    res.json(services);
};