import { App } from "aws-cdk-lib";
import { Temp010GoochyMonitorStack } from "../../src/infra/stacks/Temp010GoochyMonitorStack";
import { Capture, Match, Template } from "aws-cdk-lib/assertions";

describe("Initial test suite", () => {
	let temp010GoochyMonitorStackTemplate: Template;

	beforeAll(() => {
		const testApp = new App({
			outdir: "cdk.out",
		});

		const temp010GoochyMonitorStack = new Temp010GoochyMonitorStack(
			testApp,
			"Temp010GoochyMonitorStack"
		);
		temp010GoochyMonitorStackTemplate = Template.fromStack(
			temp010GoochyMonitorStack
		);
	});

	test("initial test", () => {
		temp010GoochyMonitorStackTemplate.hasResourceProperties(
			"AWS::Lambda::Function",
			{
				Handler: "index.handler",
				Runtime: "nodejs18.x",
			}
		);
	});

	test("Sns topic properties", () => {
		temp010GoochyMonitorStackTemplate.hasResourceProperties(
			"AWS::SNS::Topic",
			{
				DisplayName: "Temp010GoochyAlarmTopic",
				TopicName: "Temp010GoochyAlarmTopic",
			}
		);
	});

	test("Sns subscription properties - with matchers", () => {
		temp010GoochyMonitorStackTemplate.hasResourceProperties(
			"AWS::SNS::Subscription",
			Match.objectEquals({
				Protocol: "lambda",
				TopicArn: {
					Ref: Match.stringLikeRegexp("Temp010GoochyAlarmTopic"),
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
			temp010GoochyMonitorStackTemplate.findResources("AWS::SNS::Topic");
		const snsTopicName = Object.keys(snsTopic)[0];

		const lambda = temp010GoochyMonitorStackTemplate.findResources(
			"AWS::Lambda::Function"
		);
		const lambdaName = Object.keys(lambda)[0];

		temp010GoochyMonitorStackTemplate.hasResourceProperties(
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

	test("Temp010GoochyAlarm actions", () => {
		const temp010GoochyAlarmTopicActionsCapture = new Capture();

		temp010GoochyMonitorStackTemplate.hasResourceProperties(
			"AWS::CloudWatch::Alarm",
			{
				AlarmActions: temp010GoochyAlarmTopicActionsCapture,
			}
		);

		expect(temp010GoochyAlarmTopicActionsCapture.asArray()).toEqual([
			{
				Ref: expect.stringMatching(/^Temp010GoochyAlarmTopic/),
			},
		]);
	});

	test("Monitor stack snapshot", () => {
		expect(temp010GoochyMonitorStackTemplate.toJSON()).toMatchSnapshot();
	});

	test("Lambda stack snapshot", () => {
		const lambda = temp010GoochyMonitorStackTemplate.findResources(
			"AWS::Lambda::Function"
		);

		expect(lambda).toMatchSnapshot();
	});
	test("SnsTopic stack snapshot", () => {
		const snsTopic =
			temp010GoochyMonitorStackTemplate.findResources("AWS::SNS::Topic");

		expect(snsTopic).toMatchSnapshot();
	});
});
