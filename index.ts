import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Pulumi configuration
const config = new pulumi.Config();
const region = config.get("region") || "eu-west-1";

// Get Telegram secrets from Pulumi config (encrypted)
// These should be set via: pulumi config set --secret telegram_bot_auth_token <value>
const telegramBotAuthToken = config.requireSecret("telegram_bot_auth_token");
const telegramChatId = config.requireSecret("telegram_chat_id");

// Get AWS account ID for layer ARN
const awsAccountId = aws.getCallerIdentity().then(identity => identity.accountId);

// Create IAM role for Lambda function
const lambdaRole = new aws.iam.Role("elektro-scrooge-lambda-role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: {
                Service: "lambda.amazonaws.com",
            },
        }],
    }),
});

// Attach basic Lambda execution policy
const lambdaRolePolicyAttachment = new aws.iam.RolePolicyAttachment("elektro-scrooge-lambda-policy", {
    role: lambdaRole.name,
    policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
});

// Create CloudWatch Log Group for the Lambda function
const logGroup = new aws.cloudwatch.LogGroup("elektro-scrooge-log-group", {
    name: "/aws/lambda/elektro-scrooge-postPrice",
    retentionInDays: 14,
});

// Create Lambda function
const lambdaFunction = new aws.lambda.Function("elektro-scrooge-postPrice", {
    runtime: aws.lambda.Runtime.NodeJS22dX,
    handler: "dist/index.handler",
    role: lambdaRole.arn,
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./"),
    }),
    memorySize: 128,
    timeout: 60,
    environment: {
        variables: {
            TELEGRAM_BOT_AUTH_TOKEN: telegramBotAuthToken,
            TELEGRAM_CHAT_ID: telegramChatId,
        },
    },
    layers: [
        pulumi.interpolate`arn:aws:lambda:${region}:${awsAccountId}:layer:canvas-nodejs:2`,
    ],
}, { dependsOn: [lambdaRolePolicyAttachment, logGroup] });

// Create IAM role for EventBridge rule
const eventBridgeRole = new aws.iam.Role("elektro-scrooge-eventbridge-role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: {
                Service: "events.amazonaws.com",
            },
        }],
    }),
});

// Create IAM policy for EventBridge to invoke Lambda
const eventBridgePolicy = new aws.iam.RolePolicy("elektro-scrooge-eventbridge-policy", {
    role: eventBridgeRole.id,
    policy: pulumi.interpolate`{
        "Version": "2012-10-17",
        "Statement": [{
            "Action": "lambda:InvokeFunction",
            "Effect": "Allow",
            "Resource": "${lambdaFunction.arn}"
        }]
    }`,
});

// Create EventBridge rule (scheduled event)
const scheduledRule = new aws.cloudwatch.EventRule("elektro-scrooge-schedule", {
    description: "Trigger elektro-scrooge Lambda function daily at 3pm Finland winter time",
    scheduleExpression: "cron(00 13 ? * * *)",
});

// Add Lambda permission for EventBridge to invoke the function
const lambdaPermission = new aws.lambda.Permission("elektro-scrooge-lambda-permission", {
    action: "lambda:InvokeFunction",
    function: lambdaFunction.name,
    principal: "events.amazonaws.com",
    sourceArn: scheduledRule.arn,
});

// Create EventBridge target
new aws.cloudwatch.EventTarget("elektro-scrooge-event-target", {
    rule: scheduledRule.name,
    arn: lambdaFunction.arn,
    roleArn: eventBridgeRole.arn,
}, { dependsOn: [lambdaPermission, eventBridgePolicy] });

// Export the Lambda function name and ARN
export const functionName = lambdaFunction.name;
export const functionArn = lambdaFunction.arn;
export const logGroupName = logGroup.name;
export const scheduledRuleName = scheduledRule.name;
