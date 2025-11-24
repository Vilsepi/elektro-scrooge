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
    npm run test:unit
    npm run test:integration

Unit tests can be run completely offline, while integration tests call the remote API. Use `npm run test` to run all tests.

### Deploying

There's unfortunately quite a lot of manual steps to completely deploy this project:

- Install canvas lambda layer as a Serverless Application into you AWS account https://github.com/charoitel/lambda-layer-canvas-nodejs
- Setup a Telegram bot with BotFather and get your secret bot auth token and chat ID
- Setup working AWS CLI credentials
- Download a font that you want to use in the chart, and include it in the `render.ts`.

#### Using Pulumi

Install Pulumi CLI and configure your stack:

    npm install
    npm run build
    pulumi install

    export AWS_PROFILE=heap
    pulumi login s3://heap-pulumi-state/elektro-scrooge

    pulumi stack init dev
    pulumi config set aws:region eu-west-1
    pulumi config set --secret telegram_bot_auth_token <your-bot-token>
    pulumi config set --secret telegram_chat_id <your-chat-id>

Deploy:

    pulumi up

To remove all resources:

    pulumi destroy
