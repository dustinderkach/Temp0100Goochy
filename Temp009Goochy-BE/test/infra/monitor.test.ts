import { App } from "aws-cdk-lib";
import { Temp009GoochyMonitorStack } from "../../src/infra/stacks/Temp009GoochyMonitorStack";
import { Capture, Match, Template } from "aws-cdk-lib/assertions";

describe("Initial test suite", () => {
	let temp009GoochyMonitorStackTemplate: Template;

	beforeAll(() => {
		const testApp = new App({
			outdir: "cdk.out",
		});

		const temp009GoochyMonitorStack = new Temp009GoochyMonitorStack(
			testApp,
			"Temp009GoochyMonitorStack"
		);
		temp009GoochyMonitorStackTemplate = Template.fromStack(
			temp009GoochyMonitorStack
		);
	});

	test("initial test", () => {
		temp009GoochyMonitorStackTemplate.hasResourceProperties(
			"AWS::Lambda::Function",
			{
				Handler: "index.handler",
				Runtime: "nodejs18.x",
			}
		);
	});

	test("Sns topic properties", () => {
		temp009GoochyMonitorStackTemplate.hasResourceProperties(
			"AWS::SNS::Topic",
			{
				DisplayName: "Temp009GoochyAlarmTopic",
				TopicName: "Temp009GoochyAlarmTopic",
			}
		);
	});

	test("Sns subscription properties - with matchers", () => {
		temp009GoochyMonitorStackTemplate.hasResourceProperties(
			"AWS::SNS::Subscription",
			Match.objectEquals({
				Protocol: "lambda",
				TopicArn: {
					Ref: Match.stringLikeRegexp("Temp009GoochyAlarmTopic"),
				},
				Endpoint: {
					"Fn::GetAtt": [
						Match.stringLikeRegexp("webHookLambda"),
						"Arn",
					],
				},
			})
		);
	});

	test("Sns subscription properties - with exact values", () => {
		const snsTopic =
			temp009GoochyMonitorStackTemplate.findResources("AWS::SNS::Topic");
		const snsTopicName = Object.keys(snsTopic)[0];

		const lambda = temp009GoochyMonitorStackTemplate.findResources(
			"AWS::Lambda::Function"
		);
		const lambdaName = Object.keys(lambda)[0];

		temp009GoochyMonitorStackTemplate.hasResourceProperties(
			"AWS::SNS::Subscription",
			{
				Protocol: "lambda",
				TopicArn: {
					Ref: snsTopicName,
				},
				Endpoint: {
					"Fn::GetAtt": [lambdaName, "Arn"],
				},
			}
		);
	});

	test("Temp009GoochyAlarm actions", () => {
		const temp009GoochyAlarmTopicActionsCapture = new Capture();

		temp009GoochyMonitorStackTemplate.hasResourceProperties(
			"AWS::CloudWatch::Alarm",
			{
				AlarmActions: temp009GoochyAlarmTopicActionsCapture,
			}
		);

		expect(temp009GoochyAlarmTopicActionsCapture.asArray()).toEqual([
			{
				Ref: expect.stringMatching(/^Temp009GoochyAlarmTopic/),
			},
		]);
	});

	test("Monitor stack snapshot", () => {
		expect(temp009GoochyMonitorStackTemplate.toJSON()).toMatchSnapshot();
	});

	test("Lambda stack snapshot", () => {
		const lambda = temp009GoochyMonitorStackTemplate.findResources(
			"AWS::Lambda::Function"
		);

		expect(lambda).toMatchSnapshot();
	});
	test("SnsTopic stack snapshot", () => {
		const snsTopic =
			temp009GoochyMonitorStackTemplate.findResources("AWS::SNS::Topic");

		expect(snsTopic).toMatchSnapshot();
	});
});
