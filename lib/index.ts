import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as s3 from "@aws-cdk/aws-s3";
import { RemovalPolicy } from "@aws-cdk/core";

export interface StackProps extends cdk.StackProps {
  customProp?: string;
}
export class Stack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: StackProps = {}) {
    super(scope, id, props);
    const { customProp } = props;
    const defaultBucketProps = {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    };
    const bucket = new s3.Bucket(this, "Bucket", {
      ...defaultBucketProps,
      versioned: true,
    });
    const vpc = new ec2.Vpc(this, "VPC", {
      subnetConfiguration: [
        { name: "PublicSubnet", subnetType: ec2.SubnetType.PUBLIC },
      ],
    });
    const vm = new ec2.Instance(this, "VM", {
      instanceType: new ec2.InstanceType("t3.small"),
      machineImage: ec2.MachineImage.latestAmazonLinux(),
      vpc,
      vpcSubnets: {subnetType: ec2.SubnetType.PUBLIC}
    });
    
    new cdk.CfnOutput(this, "BucketName", {
      value: bucket.bucketName,
    });
  }
}
