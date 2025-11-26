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

By default, when ran locally, the program will do a dryrun, printing the price data, the text messages that would be sent to Telegram, and outputs the price graph as `graph.png` into the root of the repo. It will call the upstream API for the prices, but it will not call Telegram API.

In order to send messages to Telegram, you'll need to setup a Telegram bot and a chat, and either disable the local dryrun in the handler, or deploy the program to AWS Lambda where it will not run in dryrun mode.

### Testing

    npm run build
    npm run lint
    npm run test:unit
    npm run test:integration

Unit tests can be run completely offline, while integration tests call the remote API. Use `npm run test` to run all tests.

### Deployment prerequisites

Unfortunately, there's several manual steps to completely deploy this project:

- Setup working AWS CLI credentials
- Install [node-canvas lambda layer](https://github.com/charoitel/lambda-layer-canvas-nodejs) as a Serverless Application into your AWS account. We render the price chart using Chart.js, but its prerequisite node-canvas is too big to bundle into a lambda function, so we'll use a layer that handles it.
- Download a font `.ttf` file that you want to use in the chart, and include it in the `render.ts`.
- Setup a Telegram bot with [BotFather](https://core.telegram.org/bots/tutorial) and get your secret bot auth token and chat ID

### Deploying with Pulumi

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

    export AWS_PROFILE=heap
    npm run deploy

To remove all resources:

    export AWS_PROFILE=heap
    npm run pulumi:destroy
