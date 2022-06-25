module.exports = {
    HOST: "localhost",
    USER: "Jonny",
    PASSWORD: "CheggSpy",
    DB: "postgres",
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};