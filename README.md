# Elektro-Scrooge

A Telegram bot for monitoring spot prices of electricity. To sauna or not to sauna, that is the question.

![Electrified Scrooge](elektro-scrooge.jpg)

The app pulls hourly spot prices for Nord Pool, and divides them into day (07:00-23:59) and night (00:00-06:59) segments.

Daily averages are calculated from the day segment only. Nightly prices are ignored.

The app adds electricity company margin, Finnish VAT, grid transfer fees and electricity tax to the spot prices, so all values shown are total prices per kWh.

![Screenshot of a price message from the bot](screenshot.jpg)

## Getting started

    npm install
    npm run build
    npm run start

By default, when run locally, the program will do a dryrun, printing the HTML-formatted content of the messages instead of sending the messages to Telegram.

In order to send messages to Telegram, you'll need to setup a bot and a chat, and either disable the local dryrun, or deploy the program to AWS Lambda.

### Testing

    npm run build
    npm run lint
    npm run test

### Deploying

There's unfortunately quite a lot of manual steps to completely deploy this project:

- Install canvas lambda layer https://github.com/charoitel/lambda-layer-canvas-nodejs
- Setup a Telegram bot and make a copy of `secrets.example.yml` into `secrets.yml`.
- Setup working AWS CLI credentials
- Download a font that you want to use and include it in the `render.ts`.

Finally:

    npm install serverless
    npm run build
    npm run deploy
