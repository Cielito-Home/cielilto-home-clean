const path = require('path');

exports.getAboutPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/about.html'));
};

exports.getTeamData = (req, res) => {
    const team = [
        {
            id: 1,
            name: "María González",
            position: "Fundadora y CEO"
        }
    ];
    res.json(team);
};