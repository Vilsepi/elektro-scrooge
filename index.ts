import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const region = config.get("region") || "eu-west-1";
const stack = pulumi.getStack();

// Get Telegram secrets from Pulumi config (encrypted)
// These should be set via: pulumi config set --secret telegram_bot_auth_token <value>
const telegramBotAuthToken = config.requireSecret("telegram_bot_auth_token");
const telegramChatId = config.requireSecret("telegram_chat_id");

const awsAccountId = aws.getCallerIdentity().then(identity => identity.accountId);

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

const lambdaRolePolicyAttachment = new aws.iam.RolePolicyAttachment("elektro-scrooge-lambda-policy", {
    role: lambdaRole.name,
    policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
});

const logGroup = new aws.cloudwatch.LogGroup("elektro-scrooge-log-group", {
    name: "/aws/lambda/elektro-scrooge-postPrice",
    retentionInDays: 14,
});

const lambdaDeploymentBucket = new aws.s3.Bucket("elektro-scrooge-lambda-deployments", {
    bucket: pulumi.interpolate`elektro-scrooge-lambda-${stack}-${awsAccountId}`,
    forceDestroy: true,
    versioning: {
        enabled: true,
    },
});

const lambdaArchive = new pulumi.asset.AssetArchive({
    // Keep the dist contents at the root of the archive (no dist/ prefix inside the zip).
    ".": new pulumi.asset.FileArchive("./dist")
});

const lambdaArchiveObject = new aws.s3.BucketObject("elektro-scrooge-lambda-archive", {
    bucket: lambdaDeploymentBucket.bucket,
    key: pulumi.interpolate`lambda-${stack}.zip`,
    source: lambdaArchive,
    contentType: "application/zip",
});

const lambdaFunction = new aws.lambda.Function("elektro-scrooge-postPrice", {
    runtime: aws.lambda.Runtime.NodeJS22dX,
    handler: "index.handler",
    role: lambdaRole.arn,
    s3Bucket: lambdaDeploymentBucket.bucket,
    s3Key: lambdaArchiveObject.key,
    s3ObjectVersion: lambdaArchiveObject.versionId,
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
}, { dependsOn: [lambdaRolePolicyAttachment, logGroup, lambdaArchiveObject] });

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

const scheduledRule = new aws.cloudwatch.EventRule("elektro-scrooge-schedule", {
    description: "Trigger elektro-scrooge Lambda function daily at 3pm Finland winter time",
    scheduleExpression: "cron(00 13 ? * * *)",
});

const lambdaPermission = new aws.lambda.Permission("elektro-scrooge-lambda-permission", {
    action: "lambda:InvokeFunction",
    function: lambdaFunction.name,
    principal: "events.amazonaws.com",
    sourceArn: scheduledRule.arn,
});

new aws.cloudwatch.EventTarget("elektro-scrooge-event-target", {
    rule: scheduledRule.name,
    arn: lambdaFunction.arn,
    roleArn: eventBridgeRole.arn,
}, { dependsOn: [lambdaPermission, eventBridgePolicy] });

export const functionName = lambdaFunction.name;
export const functionArn = lambdaFunction.arn;
export const logGroupName = logGroup.name;
export const scheduledRuleName = scheduledRule.name;
