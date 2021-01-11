module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://Jonny:CheggSpy@localhost/koigoalkeeper',
    JWT_SECRET: process.env.JWT_SECRET || 'kingpendata',
    GOOGLE_SECRET: process.env.GOOGLE_SECRET || 75000,
    STRIPE_SECRET: process.env.STRIPE_SECRET || "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",
    EMAIL_SECRET: process.env.EMAIL_SECRET || 'password123!'
};