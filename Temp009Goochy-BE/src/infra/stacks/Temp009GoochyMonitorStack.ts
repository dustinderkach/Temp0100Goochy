import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Alarm, Metric, Unit } from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import { Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { LambdaSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";
import { join } from "path";

export class Temp009GoochyMonitorStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const webHookLambda = new NodejsFunction(this, "webHookLambda", {
			runtime: Runtime.NODEJS_18_X,
			handler: "handlerMonitor",
			entry: join(
				__dirname,
				"..",
				"..",
				"services",
				"monitor",
				"handlerMonitor.ts"
			),
		});

		const temp009GoochyAlarmTopic = new Topic(this, "Temp009GoochyAlarmTopic", {
			displayName: "Temp009GoochyAlarmTopic",
			topicName: "Temp009GoochyAlarmTopic",
		});

		//trigger the lambda function when the alarm is triggered
		temp009GoochyAlarmTopic.addSubscription(new LambdaSubscription(webHookLambda));

		const temp009GoochyApi4xxAlarm = new Alarm(this, "temp009GoochyApi4xxAlarm", {
			metric: new Metric({
				metricName: "4XXError",
				namespace: "AWS/ApiGateway",
				period: Duration.minutes(1),
				statistic: "Sum",
				unit: Unit.COUNT,
				dimensionsMap: {
					ApiName: "Temp009GoochyApi",
				},
			}),
			evaluationPeriods: 1,
			threshold: 5,
			alarmName: "Temp009GoochyApi4xxAlarm",
		});
		const topicAction = new SnsAction(temp009GoochyAlarmTopic);
		temp009GoochyApi4xxAlarm.addAlarmAction(topicAction);
		temp009GoochyApi4xxAlarm.addOkAction(topicAction);
	}
}
